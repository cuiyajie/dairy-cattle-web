import * as React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import App from './views/App'
import reducer from './store/reducer'
import './style/index.less'

const store = createStore(reducer)

const renderApp = () => render(
  <Provider store={ store }>
    <App />
  </Provider>,
  document.getElementById('root')
)

renderApp()