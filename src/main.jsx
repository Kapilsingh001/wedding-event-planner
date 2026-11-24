import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './features/auth/store.js'
import './index.css'
import './ui.css'
import './dark.css'
import App from './App.jsx'
import { getTheme, applyTheme } from './theme.js'
import { hideSplash, rememberSplash, playSplashOnLogin } from './splash.js'

// Set the theme before the first render so the page does not flash light first
applyTheme(getTheme())

// Keep a copy of the loading screen now, because it is removed in a moment
rememberSplash()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)

// The page is being drawn now, so the loading screen from index.html can go
hideSplash()

// Play the loading screen again each time someone logs in
playSplashOnLogin(store)
