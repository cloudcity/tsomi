const React = require('react')
const ReactDOM = require('react-dom')

const { App } = require('./components/App/')
const { PRINTABLE_PARAM } = require('./constants')

const connectToWiki = () =>
    window.open(d3.select('#wikiframe').attr('src').replace(PRINTABLE_PARAM, ''), '_blank')

ReactDOM.render(
  React.createElement(App),
  document.getElementById('container')
)

