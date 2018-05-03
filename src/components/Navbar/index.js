const React = require('react')
require('./main.css')

type NavbarProps = {
  goHome: Function,
  toggleAbout: Function
}

const Navbar = ({ toggleAbout, goHome }: NavbarProps) => {
  const logo = React.createElement('div', { onClick: goHome },
    React.createElement('img', { src: 'static/images/logo.svg' }),
    React.createElement('h1', {}, 'THE SPHERE OF MY INFLUENCE'))

  const about = React.createElement('a', { onClick: toggleAbout }, 'About')

  return React.createElement('nav', {}, 
    logo,
    React.createElement('div', { className: 'right' }, about)
  )
}

module.exports = { Navbar }

