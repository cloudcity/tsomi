// @flow

const React = require('react')
require('./main.css')

type WikiDivProps = {
  url: string,
}

const WikiDiv = ({ url }: WikiDivProps) => {
  const iframe = React.createElement('iframe', {
    name: 'wiki',
    id: 'wikiframe',
    src: url,
  })

  return React.createElement(
    'div',
    {
      id: 'wikidiv',
    },
    iframe,
  )
}

module.exports = { WikiDiv }
