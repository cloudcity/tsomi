const $ = require('jquery')
const d3 = require('d3')
const React = require('react')
const ReactDOM = require('react-dom')

const { App } = require('./components/App/')
const { History } = require('./components/History/')
const { render } = require('./components/Renderer/')
const { PRINTABLE_PARAM } = require('./constants')

const history = new History()

const connectToWiki = () =>
    window.open(d3.select('#wikiframe').attr('src').replace(PRINTABLE_PARAM, ''), '_blank')

ReactDOM.render(
  React.createElement(App),
  document.getElementById('wikidiv')
)

$(document).ready(() => {
  render(history)
})

