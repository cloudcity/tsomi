// @flow

const React = require('react')

const { render } = require('../Renderer/')
const { WikiDiv } = require('../Wikidiv/')
const { History } = require('../History/')

type AppProps = {}
type AppState = {
  history: History,
  wikiDivHidden: boolean
}

class App extends React.Component<AppProps, AppState> {
  state: AppState

  constructor() {
    super()

    this.state = {
      history: new History(),
      wikiDivHidden: false
    }
  }

  componentDidMount() {
    render(this.state.history)
  }

  render() {
    const innerChartDiv = React.createElement('div', { id: 'chart' })
    const chartDiv = React.createElement('div', {
      id: 'chartdiv',
    }, innerChartDiv)

    const wikiDiv = React.createElement(WikiDiv, { 
      hidden: this.state.wikiDivHidden,
    })

    return React.createElement(React.Fragment, {}, chartDiv, wikiDiv)
  }
}

module.exports = { App }

