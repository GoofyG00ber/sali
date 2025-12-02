// Lightweight Barion Pixel loader + scaffold
// - Reads a pixel id passed to `initBarion` and optionally loads an external script
// - Exposes `initBarion`, `trackPageView`, and `trackPurchase` functions

let _pixelId: string | null = null
let _ready = false

type InitOpts = {
  scriptUrl?: string | null
}

export function initBarion(pixelId: string, opts: InitOpts = {}) {
  if (!pixelId) return
  _pixelId = pixelId

  // If scriptUrl provided, load external script
  if (opts.scriptUrl) {
    try {
      const s = document.createElement('script')
      s.async = true
      s.src = opts.scriptUrl
      s.onload = () => {
        _ready = true
        window.dispatchEvent(new CustomEvent('barion-ready'))
      }
      s.onerror = () => {
        console.warn('Barion pixel script failed to load:', opts.scriptUrl)
        _ready = true
        window.dispatchEvent(new CustomEvent('barion-ready'))
      }
      document.head.appendChild(s)
    } catch (e) {
      console.warn('Failed to append Barion script', e)
      _ready = true
      window.dispatchEvent(new CustomEvent('barion-ready'))
    }
  } else {
    // No external script; mark ready so consumer code can still emit events
    _ready = true
    window.dispatchEvent(new CustomEvent('barion-ready'))
  }
}

function ensureReady(): Promise<void> {
  if (_ready) return Promise.resolve()
  return new Promise(resolve => {
    const cb = () => {
      window.removeEventListener('barion-ready', cb)
      resolve()
    }
    window.addEventListener('barion-ready', cb)
  })
}

export async function trackPageView(extra: Record<string, any> = {}) {
  await ensureReady()
  if (!_pixelId) return

  // If external Barion object is available, try to call its pageview method
  // (left intentionally generic; if Barion provides a specific API, adjust here)
  // Fallback: emit a DOM event so the site or other scripts can listen for it
  try {
    // @ts-ignore
    const win: any = window
    if (win.Barion && typeof win.Barion.track === 'function') {
      // @ts-ignore
      win.Barion.track('pageview', { pixelId: _pixelId, ...extra })
      return
    }
  } catch (e) {
    // ignore
  }

  console.log('Barion pixel pageview', { pixelId: _pixelId, ...extra })
  window.dispatchEvent(new CustomEvent('barion-pixel-event', { detail: { type: 'pageview', pixelId: _pixelId, ...extra } }))
}

export async function trackPurchase(payload: { orderId?: string; value?: number; currency?: string; [k: string]: any }) {
  await ensureReady()
  if (!_pixelId) return

  try {
    // @ts-ignore
    const win: any = window
    if (win.Barion && typeof win.Barion.track === 'function') {
      // @ts-ignore
      win.Barion.track('purchase', { pixelId: _pixelId, ...payload })
      return
    }
  } catch (e) {
    // ignore
  }

  console.log('Barion pixel purchase', { pixelId: _pixelId, ...payload })
  window.dispatchEvent(new CustomEvent('barion-pixel-event', { detail: { type: 'purchase', pixelId: _pixelId, ...payload } }))
}

export default {
  initBarion,
  trackPageView,
  trackPurchase
}
