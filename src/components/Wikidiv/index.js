// @flow

const React = require('react')
require('./main.css')

type WikiProps = {
  onClick: Function,
  shown: boolean
}

const WikiDiv = (props: WikiProps) => {
  const iframe = React.createElement('iframe', { 
    name: 'wiki', 
    id: 'wikiframe', 
    src: '',
    onClick: () => console.log('clicked!')
  })
 
  return React.createElement('div', { 
    className: props.shown ? '' : 'hidden',
    onClick: () => console.log('aaaa') //, props.onClick
  }, iframe)
}

module.exports = { WikiDiv }

