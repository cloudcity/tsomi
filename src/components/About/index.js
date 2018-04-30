const React = require('react')
require('./main.css')

type AboutProps = {
  goBack: Function
}

const linkTo = (name: string): string =>
  `${window.location.origin}/?subject=${name}`

const About = ({ goBack }: AboutProps) => {
  const heading = React.createElement('h1', {}, 'The Sphere of My Influence')
  const logo = React.createElement('img', {
    src: 'static/images/logo.svg'
  })

  const tagline = React.createElement('p', {}, 
    'The Sphere of My Influence is a visual tool to explore ' +
    'the flow of influences between people of note.'
  )

  const steph = React.createElement('a', { href: 'https://www.linkedin.com/in/stephaniegeerlings' }, 'Stephanie Geerlings')
  const trebor = React.createElement('a', { href: 'http://trebor.org/fdl/home' }, 'Robert Harris')
  const ccd = React.createElement('a', { href: 'https://www.cloudcity.io/' }, 'Cloud City')
  const d3 = React.createElement('a', { href: 'https://d3js.org/' }, 'd3.js')
  const sparql = React.createElement('a', { href: 'https://www.w3.org/TR/rdf-sparql-query/' }, 'sparql')
  const dbpedia = React.createElement('a', { href: 'http://wiki.dbpedia.org/' }, 'dbpedia')

  const explain = React.createElement('p', {}, 
    'Created by ', steph, ', ', trebor, ' and ', ccd, ', TSOMI was hand-crafted ' +
    'using ', d3, ' and ', sparql, ' to query the ', dbpedia, ' for influence links ' +
    'between persons who appear in Wikipedia.'
  )

  const debeauvoir = React.createElement('a', { href: linkTo('Simone_de_Beauvoir') }, 'Simone de Beauvoir')
  const dylan = React.createElement('a', { href: linkTo('Bob_Dylan') }, 'Bob Dylan')
  const kahlo = React.createElement('a', { href: linkTo('Frida_Kahlo') }, 'Frida Kahlo')
  const einstein = React.createElement('a', { href: linkTo('Albert_Einstein') }, 'Albert Einstein')

  const wrapInLi = el => 
    React.createElement('li', {}, el)

  const list = React.createElement('ul', {}, 
    React.createElement('h2', {}, 'Some suggestions of places to start:'),
    wrapInLi(debeauvoir),
    wrapInLi(dylan),
    wrapInLi(kahlo),
    wrapInLi(einstein)
  )

  const button = React.createElement('button', {
    onClick: goBack
  }, 'Return to TSOMI')

  const contents = React.createElement('div', {}, 
    logo, 
    heading,
    tagline, 
    explain, 
    list,
    button
  )

  return React.createElement('div', { className: 'about-container' }, contents)
}

module.exports = { About }

