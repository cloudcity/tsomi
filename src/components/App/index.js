// @flow

const React = require('react')

const { render } = require('../Renderer/')
const { WikiDiv } = require('../Wikidiv/')
const { Navbar } = require('../Navbar/')
const { History } = require('../History/')
const { subjects } = require('../../constants')
const { About } = require('../About/')
const { getURLParameter } = require('../../util')
require('./main.css')

type AppProps = {}
type AppState = {
  history: History,
  showAboutPage: boolean,
  subject: string,
  wikiDivHidden: boolean,
  url: string,
}

const getUrlFromNode = (node: any): string =>
  node.getProperty('wikiTopic').replace(/en./, 'en.m.')

const getUrlFromSubject = () => {
  const subject = getURLParameter('subject')
  return subject
    ? `en.m.wikipedia.org/wiki/${ getURLParameter('subject') }`
    : 'https://en.m.wikipedia.org/wiki/Joyce_Carol_Oates'
}

const changeSubject = (url: string, subject: string) => {
  const sanitizedSubject = `?subject=${ subject.replace(/ /g, '_') }`

  return /subject=/.test(url)
    ? url.replace(/\?subject=.+/, sanitizedSubject)
    : url + sanitizedSubject
}
class App extends React.Component<AppProps, AppState> {
  state: AppState

  constructor() {
    super()
      
    this.state = {
      history: new History(),
      showAboutPage: false,
      subject: subjects.oates,
      wikiDivHidden: false,
      url: getUrlFromSubject(),
    }
  }

  componentDidMount() {
    window.setWikiPage = this.setWikiPage.bind(this) // good god i'm so sorry

    if (!this.state.showAboutPage)
      render(this.state.history)
  }
  
  wikiFrameLoad() {
    // d3 intercepts popstate events.
    // when the wikiframe reloads,
    // we need to pass that event on to
    // the window so that d3 can see it.
    // otherwise it'll be swallowed by
    // the wikiframe itself.
    const e = new Event('popstate')
    window.dispatchEvent(e)
  }

  setWikiPage(node: any) {
    const url = getUrlFromNode(node)

    window.history.pushState({}, '', changeSubject(
      window.location.href, 
      node.properties.name
    ))

    this.setState({ url })
  }

  toggleAboutPage() {
    this.setState({ showAboutPage: !this.state.showAboutPage })
  }

  render() {
    const navbar = React.createElement(Navbar, {
      key: 'navbar', 
      toggleAbout: () => this.toggleAboutPage()
    })
    
    const about = React.createElement(About, {
      key: 'about', 
      goBack: () => this.toggleAboutPage()
    })
    
    const innerChartDiv = React.createElement('div', { id: 'chart' })
    const chartDiv = React.createElement('div', {
      key: 'chartdiv', 
      id: 'chartdiv',
    }, innerChartDiv)

    const wikiDiv = React.createElement(WikiDiv, { 
      hidden: this.state.wikiDivHidden,
      key: 'wikidiv',
      onLoad: () => this.wikiFrameLoad(),
      subject: this.state.subject,
      url: this.state.url
    })
    
    if (this.state.showAboutPage) {
      return React.createElement(React.Fragment, {}, 
        navbar,
        React.createElement('div', { className: 'container-wrapper', }, 
          about, 
          chartDiv, 
          wikiDiv
        )
      )
    } else {
      return React.createElement(React.Fragment, {}, 
        navbar, 
        React.createElement('div', { className: 'container-wrapper' }, chartDiv, wikiDiv)
      )
    }
  }
}

module.exports = { App }

