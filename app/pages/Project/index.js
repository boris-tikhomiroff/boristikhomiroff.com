import Page from 'classes/Page'

export default class Project extends Page {
  constructor() {
    super({
      id: 'project',

      element: '.project',
      elements: {
        wrapper: '.project__wrapper',

        navigation: document.querySelector('.navigation'),

        sticky: '.project__aside',
      },
    })
  }

  create() {
    super.create()
  }
}
