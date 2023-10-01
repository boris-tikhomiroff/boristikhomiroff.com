import { each, map } from 'lodash'
import GSAP from 'gsap'
import Prefix from 'prefix'
// import NormalizeWheel from 'normalize-wheel'

import AsyncLoad from 'classes/AsyncLoad'

export default class Page {
  constructor({ element, elements, id }) {
    this.selector = element
    this.selectorChildren = {
      ...elements,
      preloaders: '[data-src]',
    }

    this.id = id

    this.transformPrefix = Prefix('transform')

    // this.onMouseWheelEvent = this.onWheel.bind(this)
  }

  create() {
    this.element = document.querySelector(this.selector)
    this.elements = {}

    this.scroll = {
      current: 0,
      target: 0,
      last: 0,
      limit: 0,
    }

    each(this.selectorChildren, (entry, key) => {
      if (
        entry instanceof window.HTMLElement ||
        entry instanceof window.NodeList ||
        Array.isArray(entry)
      ) {
        this.elements[key] = entry
      } else {
        this.elements[key] = document.querySelectorAll(entry)

        if (this.elements[key].length === 0) {
          this.elements[key] = null
        } else if (this.elements[key].length === 1) {
          this.elements[key] = document.querySelector(entry)
        }
      }
    })

    this.createPreloader()
  }

  createPreloader() {
    each(this.elements.preloaders, element => {
      return new AsyncLoad({
        element,
      })
    })
  }

  /**
   * Animated in the page
   */
  show() {
    return new Promise(resolve => {
      this.animationIn = GSAP.timeline()

      this.animationIn.fromTo(
        this.element,
        {
          autoAlpha: 0,
        },
        {
          autoAlpha: 1,
        },
      )

      this.animationIn.call(() => {
        this.addEventListeners()

        resolve()
      })
    })
  }

  /**
   * Animated out the page
   */
  hide() {
    return new Promise(resolve => {
      // this.removeEventListeners()
      this.destroy()

      this.animationOut = GSAP.timeline({})

      this.animationOut.to(this.element, {
        autoAlpha: 0,
        onComplete: resolve,
      })
    })
  }

  /**
   * Events.
   */
  onResize() {
    if (this.elements.wrapper) {
      this.scroll.limit =
        this.elements.wrapper.clientHeight - window.innerHeight
    }
  }

  onWheel(normalized) {
    const speed = normalized.pixelY

    this.scroll.target += speed
  }

  /**
   * Loop.
   */
  update() {
    this.scroll.target = GSAP.utils.clamp(
      0,
      this.scroll.limit,
      this.scroll.target,
    )

    this.scroll.current = GSAP.utils.interpolate(
      this.scroll.current,
      this.scroll.target,
      0.1,
    )

    if (this.scroll.current < 0.01) {
      this.scroll.current = 0
    }

    if (this.elements.wrapper) {
      this.elements.wrapper.style[
        this.transformPrefix
      ] = `translateY(-${this.scroll.current}px)`
    }
  }

  /**
   * Listeners.
   */
  addEventListeners() {}

  removeEventListeners() {}

  /**
   * Destroy.
   */
  destroy() {
    this.removeEventListeners()
  }
}
