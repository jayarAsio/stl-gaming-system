import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Remove the page loader injected in index.html once React has mounted
;(function removePageLoader() {
  try {
    const loader = document.getElementById('page-loader')
    if (!loader) return
    // Force a small delay to ensure first paint of the app (can be 0)
    requestAnimationFrame(() => {
      // Fade out using CSS class, then remove the node after transition
      loader.classList.add('page-loader--fade')
      const remove = () => loader.parentNode && loader.parentNode.removeChild(loader)
      // Use transitionend when supported, fallback to timeout
      const onTransitionEnd = (e) => {
        if (e && e.target !== loader) return
        remove()
        loader.removeEventListener('transitionend', onTransitionEnd)
      }
      loader.addEventListener('transitionend', onTransitionEnd)
      // Fallback removal in case transitionend doesn't fire
      setTimeout(remove, 500)
    })
  } catch (err) {
    // swallow errors - loader removal is non-critical
    console.error('Page loader removal failed:', err)
  }
})()

// Ensure headers that rely on JS-applied animation classes are visible
;(function ensureHeadersVisible() {
  try {
    // Run on next paint so any server-rendered markup exists
    requestAnimationFrame(() => {
      const headers = document.querySelectorAll('.header');
      headers.forEach(h => h.classList.add('is-visible'));
    });
  } catch (err) {
    // non-critical — log for diagnostics
    // console.error('ensureHeadersVisible failed', err)
  }
})();
