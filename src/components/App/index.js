// @flow

const React = require('react')

const { WikiDiv } = require('../Wikidiv')

type AppProps = {}
type AppState = {
  showWikiDiv: boolean
}

class App extends React.Component<AppProps, AppState> {
  state: AppState

  constructor() {
    super()

    this.state = {
      showWikiDiv: false
    }
  }

  handleWikiDivClick() {
    console.log('clicked!!')
    this.setState({ showWikiDiv: !this.state.showWikiDiv })
  }

  render() {
    const wikiDiv = React.createElement(WikiDiv, { 
      shown: this.state.showWikiDiv,
      onClick: () => this.handleWikiDivClick()
    })

    return (
      wikiDiv
    )
  }
}

module.exports = { App }

