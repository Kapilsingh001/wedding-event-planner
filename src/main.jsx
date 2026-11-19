import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './features/auth/store.js'
import './index.css'
import App from './App.jsx'
import { getTheme, applyTheme } from './theme.js'

// Set the theme before the first render so the page does not flash light first
applyTheme(getTheme())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
