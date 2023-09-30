import { each } from 'lodash'

import Preloader from 'components/Preloader'
import Canvas from 'components/Canvas'

import Home from 'pages/home'
import About from 'pages/about'
import Project from 'pages/Project'

class App {
  constructor() {
    this.createContent()

    this.createPreloader()
    this.createCanvas()
    this.createPages()

    this.addEventListeners()
    this.addLinkListeners()

    this.update()
  }

  createPreloader() {
    this.preloader = new Preloader()
    this.preloader.once('completed', this.onPreloaded.bind(this))
  }

  createCanvas() {
    this.canvas = new Canvas()
  }

  createContent() {
    this.content = document.querySelector('.content')
    this.template = this.content.getAttribute('data-template')
  }

  createPages() {
    this.pages = {
      home: new Home(),
      about: new About(),
      project: new Project(),
    }

    this.page = this.pages[this.template]

    this.page.create()
  }

  /**
   * Events.
   */
  onPreloaded() {
    this.preloader.destroy()

    this.onResize()

    this.page.show()
  }

  onPopState() {
    console.log(window.location.pathname)
    this.onChange({
      url: window.location.pathname,
      push: false,
    })
  }

  async onChange({ url, push = true }) {
    // First animated out the current page
    await this.page.hide()

    const request = await window.fetch(url)

    if (request.status === 200) {
      const html = await request.text()
      const div = document.createElement('div')

      if (push) {
        window.history.pushState({}, '', url)
      }

      div.innerHTML = html

      const divContent = div.querySelector('.content')

      this.template = divContent.getAttribute('data-template')

      this.content.setAttribute('data-template', this.template)
      this.content.innerHTML = divContent.innerHTML

      this.page = this.pages[this.template]
      this.page.create()

      this.onResize()

      this.page.show()

      this.addLinkListeners()
    } else {
      console.log('Error')
    }
  }

  onResize() {
    if (this.canvas && this.canvas.onResize) {
      this.canvas.onResize()
    }

    if (this.page && this.page.onResize) {
      this.page.onResize()
    }
  }

  /**
   * Loop.
   */
  update() {
    if (this.canvas && this.canvas.update) {
      this.canvas.update()
    }

    if (this.page && this.page.update) {
      this.page.update()
    }

    this.frame = window.requestAnimationFrame(this.update.bind(this))
  }

  /**
   * Listeners.
   */
  addEventListeners() {
    window.addEventListener('popstate', this.onPopState.bind(this))

    window.addEventListener('resize', this.onResize.bind(this))
  }

  addLinkListeners() {
    const links = document.querySelectorAll('a')

    each(links, link => {
      link.onclick = event => {
        event.preventDefault()

        const { href } = link

        this.onChange({ url: href, push: true })
      }
    })
  }
}

new App()
