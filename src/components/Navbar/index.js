const React = require('react')
require('./main.css')

type NavbarProps = {
  toggleAbout: Function
}

const Navbar = ({ toggleAbout }: NavbarProps) => {
  const logo = React.createElement('img', { src: 'static/images/logo.svg' })
  const title = React.createElement('h1', {}, 'THE SPHERE OF MY INFLUENCE')
  const about = React.createElement('a', { onClick: toggleAbout }, 'About')

  return React.createElement('nav', {}, 
    React.createElement('div', {}, logo, title),
    React.createElement('div', { className: 'right' }, about)
  )
}

module.exports = { Navbar }

