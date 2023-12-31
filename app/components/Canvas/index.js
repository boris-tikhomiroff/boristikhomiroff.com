import { Camera, Renderer, Program, Transform, Box, Mesh } from 'ogl'

import Home from './Home'

export default class Canvas {
  constructor() {
    this.x = {
      start: 0,
      distance: 0,
      end: 0,
    }

    this.createRenderer()
    this.createCamera()
    this.createScene()

    this.onResize()

    this.createHome()
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
    })

    this.gl = this.renderer.gl

    document.body.appendChild(this.gl.canvas)
  }

  createCamera() {
    this.camera = new Camera(this.gl)
    this.camera.position.z = 5
  }

  createScene() {
    this.scene = new Transform()
  }

  createHome() {
    this.home = new Home({
      gl: this.gl,
      scene: this.scene,
      sizes: this.sizes,
    })
  }

  /**
   * Events.
   */
  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.camera.perspective({
      aspect: window.innerWidth / window.innerHeight,
    })

    const fov = this.camera.fov * (Math.PI / 180)
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    const width = height * this.camera.aspect

    this.sizes = {
      height,
      width,
    }

    if (this.home) {
      this.home.onResize({
        sizes: this.sizes,
      })
    }
  }

  onTouchDown(event) {
    this.isDown = true

    this.x.start = event.touches ? event.touches[0].clientX : event.clientX

    if (this.home) {
      this.home.onTouchDown({
        x: this.x,
      })
    }

    // console.log('down:', this.x)
  }

  onTouchMove(event) {
    if (!this.isDown) return

    const x = event.touches ? event.touches[0].clientX : event.clientX

    this.x.end = x

    // this.x.distance = this.x.start - this.x.end

    if (this.home) {
      this.home.onTouchMove({
        x: this.x,
      })
    }

    // console.log('move:', this.x)
  }

  onTouchUp(event) {
    this.isDown = false

    const x = event.changedTouches
      ? event.changedTouches[0].clientX
      : event.clientX

    this.x.end = x

    this.x.distance = this.x.start - this.x.end

    if (this.home) {
      this.home.onTouchUp({
        x: this.x,
      })
    }
  }

  onWheel(event) {}

  /**
   * Loop.
   */
  update() {
    if (this.home && this.home.update) {
      this.home.update()
    }

    this.renderer.render({ scene: this.scene, camera: this.camera })
  }
}
