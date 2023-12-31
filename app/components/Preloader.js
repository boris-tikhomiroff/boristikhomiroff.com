import GSAP from 'gsap'

import Component from 'classes/Component'

import { each } from 'lodash'

import { split } from 'utils/text'

export default class Preloader extends Component {
  constructor() {
    super({
      element: '.preloader',
      elements: {
        title: '.preloader__text',
        number: '.preloader__number',
        numberText: '.preloader__number__text',
        images: document.querySelectorAll('img'),
      },
    })

    split({
      element: this.elements.title,
      expression: '<br>',
    })

    split({
      element: this.elements.title,
      expression: '<br>',
    })

    this.elements.titleSpans = this.elements.title.querySelectorAll('span span')

    this.length = 0

    this.createLoader()
  }

  createLoader() {
    each(this.elements.images, element => {
      element.onload = () => this.onAssetsLoaded(element)
      element.src = element.getAttribute('data-src')
      element.classList.add('loaded')
    })
  }

  onAssetsLoaded(image) {
    this.length += 1

    const percent = this.length / this.elements.images.length

    this.elements.numberText.innerHTML = `${Math.round(percent * 100)}%`

    if (percent === 1) {
      this.onLoaded()
    }
  }

  onLoaded() {
    return new Promise(resolve => {
      this.animateOut = GSAP.timeline({
        delay: 2,
      })

      this.animateOut.to(this.elements.titleSpans, {
        duration: 1.5,
        ease: 'expo.out',
        stagger: 0.1,
        y: '100%',
      })

      this.animateOut.to(
        this.elements.numberText,
        {
          duration: 1.5,
          ease: 'expo.out',
          stagger: 0.1,
          y: '100%',
        },
        '-=1.4',
      )

      this.animateOut.to(
        this.element,
        {
          // autoAlpha: 0,

          duration: 1.5,
          ease: 'expo.out',
          scaleY: 0,
          transformOrigin: '0 0',
        },
        '-=1',
      )

      this.animateOut.call(() => {
        this.emit('completed')
      })
    })
  }

  destroy() {
    this.element.parentNode.removeChild(this.element)
  }
}
