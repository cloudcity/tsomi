import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import { logger } from 'redux-logger'

import config from './config'
import App from './components/App/'
import { runState } from './store'

const store = config.debug
  ? createStore(runState, applyMiddleware(logger))
  : createStore(runState)

ReactDOM.render(
  React.createElement(Provider, { store }, React.createElement(App)),
  document.getElementById('container'),
)
