import { Mesh, Program, Texture } from 'ogl'

import vertex from 'shaders/plane-vertex.glsl'
import fragment from 'shaders/plane-fragment.glsl'

export default class Media {
  constructor({ element, index, geometry, gl, scene, sizes }) {
    this.element = element
    this.index = index
    this.geometry = geometry
    this.gl = gl
    this.scene = scene
    this.sizes = sizes

    this.createTexture()
    this.createProgram()
    this.createMesh()
  }

  createTexture() {
    this.texture = new Texture(this.gl)

    // console.log(this.element)

    this.image = new Image()
    this.image.crossOrigin = 'Anonymous'
    this.image.src = this.element.getAttribute('data-src')
    this.image.onload = () => (this.texture.image = this.image)
  }

  createProgram() {
    this.program = new Program(this.gl, {
      fragment,
      vertex,
      uniforms: {
        tMap: { value: this.texture },
      },
    })
  }

  createMesh() {
    this.mesh = new Mesh(this.gl, {
      program: this.program,
      geometry: this.geometry,
    })

    this.mesh.setParent(this.scene)

    this.mesh.scale.x = 2
  }

  createBounds({ sizes }) {
    this.sizes = sizes

    this.bounds = this.element.getBoundingClientRect()

    this.updateScale(sizes)
  }

  updateScale() {
    this.width = this.bounds.width / window.innerWidth
    this.height = this.bounds.height / window.innerHeight

    this.mesh.scale.x = this.sizes.width * this.width
    this.mesh.scale.y = this.sizes.height * this.height

    this.x = this.bounds.left / window.innerWidth
    this.y = this.bounds.top / window.innerHeight
  }

  updateX(x = 0) {
    this.mesh.position.x =
      -this.sizes.width / 2 + this.mesh.scale.x / 2 + this.x * this.sizes.width
  }

  // updateY(y = 0) {
  //   this.mesh.position.y =
  //     this.sizes.height / 2 - this.mesh.scale.y / 2 - this.y * this.sizes.height
  // }

  update(scroll) {
    this.updateX(scroll.x)
  }

  onResize(sizes) {
    this.createBounds(sizes)
  }
}
