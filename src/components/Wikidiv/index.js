// @flow

const React = require('react')

require('./main.css')

type WikiDivProps = {
  className: string,
  subject: string,
  url: string
}

const WikiDiv = ({ className, url }: WikiDivProps) => {
  const iframe = React.createElement('iframe', {
    name: 'wiki',
    id: 'wikiframe',
    src: url,
  })

  return React.createElement('div', {
    className: className,
    //style: {
      //display: hidden ? 'none' : 'block',
    //},
    id: 'wikidiv',
  }, iframe)
}

module.exports = { WikiDiv }

