require('dotenv').config()

const logger = require('morgan')
const express = require('express')
const errorHandler = require('errorhandler')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const app = express()
const path = require('path')
const port = 3000

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride())
app.use(errorHandler())
app.use(express.static(path.join(__dirname, 'public')))

const Prismic = require('@prismicio/client')
const PrismicDOM = require('prismic-dom')
const UAParser = require('ua-parser-js')

const initApi = req => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req,
  })
}

const handleLinkResolver = doc => {
  if (doc.type === 'project') {
    return `/project/${doc.uid}`
  }

  if (doc.type === 'about') {
    return '/about'
  }

  if (doc.type === 'contact') {
    return '/contact'
  }

  return '/'
}

app.use((req, res, next) => {
  const ua = UAParser(req.headers['user-agent'])

  res.locals.isDesktop = ua.device.type === undefined
  res.locals.isPhone = ua.device.type === 'mobile'
  res.locals.isTablet = ua.device.type === 'tablet'

  res.locals.Link = handleLinkResolver

  res.locals.Numbers = index => {
    return index == 0
      ? 'One'
      : index == 1
      ? 'Two'
      : index == 2
      ? 'Three'
      : index == 3
      ? 'Four'
      : ''
  }

  res.locals.PrismicDOM = PrismicDOM

  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

const handleRequest = async api => {
  const preloader = await api.getSingle('preloader')
  // console.log("preloader: --------------", preloader.data.title)

  const about = await api.getSingle('about')
  const home = await api.getSingle('home', {
    fetchLinks: ['product.title', 'product.image', 'product.uid'],
  })

  const assets = home.data.gallery.map(item => {
    return {
      id: item.product.id,
      uid: item.product.uid,
      alt: item.product.data.image.alt,
      url: item.product.data.image.url,
    }
  })

  const { data: project } = api.options.req.params.uid
    ? await api.getByUID('product', api.options.req.params.uid, {
        fetchLinks: ['product.title', 'product.image', 'product.uid'],
      })
    : ''

  return {
    about,
    home,
    assets,
    project,
    preloader,
  }
}

app.get('/', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)

  res.render('pages/home', {
    ...defaults,
  })
})

app.get('/about', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)

  res.render('pages/about', {
    ...defaults,
  })
})

app.get('/project/:uid', async (req, res) => {
  const api = await initApi(req)

  const defaults = await handleRequest(api)

  res.render('pages/project', {
    ...defaults,
  })
})

app.get('/contact', async (req, res) => {
  const api = await initApi(req)

  res.render('pages/contact')
})

// app.get('/*', async (req, res) => {
//   res.render('pages/notFound')
// })

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
