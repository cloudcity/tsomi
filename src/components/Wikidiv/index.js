// @flow

const React = require('react')
require('./main.css')

const WikiDiv = () => {
  const iframe = React.createElement('iframe', { 
    name: 'wiki', 
    id: 'wikiframe', 
    src: ''
  })

  return React.createElement('div', {
    id: 'wikidiv',
  }, iframe)
}

module.exports = { WikiDiv }

