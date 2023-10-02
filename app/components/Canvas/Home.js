import { Plane, Transform } from 'ogl'
import { map } from 'lodash'
import GSAP from 'gsap'

import Media from './Media'

export default class Home {
  constructor({ gl, scene, sizes }) {
    this.gl = gl
    this.sizes = sizes

    this.group = new Transform()

    this.galleryElement = document.querySelector('.home__gallery')
    this.mediasElements = document.querySelectorAll(
      '.home__gallery__media__image',
    )

    this.createGeometry()
    this.createGallery()

    this.group.setParent(scene)

    this.x = {
      current: 0,
      target: 0,
      lerp: 0.1,
    }

    this.scroll = {
      x: 0,
    }

    this.scrollCurrent = {
      x: 0,
    }
  }

  createGeometry() {
    this.geometry = new Plane(this.gl)
  }

  createGallery() {
    this.medias = map(this.mediasElements, (element, index) => {
      return new Media({
        element,
        geometry: this.geometry,
        index,
        scene: this.group,
        gl: this.gl,
        sizes: this.sizes,
      })
    })
  }

  /**
   * Events.
   */
  onResize(event) {
    this.galleryBounds = this.galleryElement.getBoundingClientRect()

    map(this.medias, media => media.onResize(event))

    this.gallerySizes = {
      width: (this.galleryBounds.width / window.innerWidth) * this.sizes.width,
    }

    this.sizes = event.sizes
  }

  onTouchDown({ x, y }) {
    this.scrollCurrent.x = this.scroll.x
  }

  onTouchMove({ x, y }) {
    const xDistance = x.start - x.end
    this.x.target = this.scrollCurrent.x - xDistance
  }

  onTouchUp({ x, y }) {}

  onWheel(event) {}

  /**
   * Update.
   */
  update() {
    if (!this.galleryBounds) return

    this.x.current = GSAP.utils.interpolate(
      this.x.current,
      this.x.target,
      this.x.lerp,
    )

    if (this.scroll.x < this.x.current) {
      this.x.direction = 'right'
    } else if (this.scroll.x > this.x.current) {
      this.x.direction = 'left'
    }

    // this.galleryWidth =
    //   (this.galleryBounds.width / window.innerWidth) * this.sizes.width

    this.scroll.x = this.x.current

    map(this.medias, (media, index) => {
      const scaleX = media.mesh.scale.x / 2

      if (this.x.direction === 'left') {
        const x = media.mesh.position.x + scaleX

        if (x < -this.sizes.width / 2) {
          media.extra.x += this.gallerySizes.width
        }
      } else if (this.x.direction === 'right') {
        const x = media.mesh.position.x - scaleX

        if (x > this.sizes.width / 2) {
          media.extra.x -= this.gallerySizes.width
        }
      }
      media.update(this.scroll)
    })
  }
}
