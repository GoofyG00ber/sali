// Lightweight Barion Pixel loader + scaffold
// - Reads a pixel id passed to `initBarion` and optionally loads an external script
// - Exposes functions for mandatory Barion Pixel events: grantConsent, setEncryptedEmail, contentView, addToCart, initiateCheckout, initiatePurchase, purchase

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

export async function grantConsent() {
  await ensureReady()
  if (!_pixelId) return

  try {
    const win: any = window
    if (win.Barion && typeof win.Barion.track === 'function') {
      win.Barion.track('grantConsent', { pixelId: _pixelId })
      return
    }
  } catch (e) {
    // ignore
  }

  // console.log('Barion pixel grantConsent', { pixelId: _pixelId })
  window.dispatchEvent(new CustomEvent('barion-pixel-event', { detail: { type: 'grantConsent', pixelId: _pixelId } }))
}

export async function setEncryptedEmail(email: string) {
  await ensureReady()
  if (!_pixelId) return

  try {
    const win: any = window
    if (win.Barion && typeof win.Barion.track === 'function') {
      win.Barion.track('setEncryptedEmail', { pixelId: _pixelId, email })
      return
    }
  } catch (e) {
    // ignore
  }

  console.log('Barion pixel setEncryptedEmail', { pixelId: _pixelId, email })
  window.dispatchEvent(new CustomEvent('barion-pixel-event', { detail: { type: 'setEncryptedEmail', pixelId: _pixelId, email } }))
}

export async function contentView(contentId: string, contentType?: string) {
  await ensureReady()
  if (!_pixelId) return

  try {
    const win: any = window
    if (win.Barion && typeof win.Barion.track === 'function') {
      win.Barion.track('contentView', { pixelId: _pixelId, contentId, contentType })
      return
    }
  } catch (e) {
    // ignore
  }

  // console.log('Barion pixel contentView', { pixelId: _pixelId, contentId, contentType })
  window.dispatchEvent(new CustomEvent('barion-pixel-event', { detail: { type: 'contentView', pixelId: _pixelId, contentId, contentType } }))
}

export async function addToCart(productId: string, quantity: number, price?: number, currency?: string) {
  await ensureReady()
  if (!_pixelId) return

  try {
    const win: any = window
    if (win.Barion && typeof win.Barion.track === 'function') {
      win.Barion.track('addToCart', { pixelId: _pixelId, productId, quantity, price, currency })
      return
    }
  } catch (e) {
    // ignore
  }

  console.log('Barion pixel addToCart', { pixelId: _pixelId, productId, quantity, price, currency })
  window.dispatchEvent(new CustomEvent('barion-pixel-event', { detail: { type: 'addToCart', pixelId: _pixelId, productId, quantity, price, currency } }))
}

export async function initiateCheckout(cartValue?: number, currency?: string) {
  await ensureReady()
  if (!_pixelId) return

  try {
    const win: any = window
    if (win.Barion && typeof win.Barion.track === 'function') {
      win.Barion.track('initiateCheckout', { pixelId: _pixelId, cartValue, currency })
      return
    }
  } catch (e) {
    // ignore
  }

  console.log('Barion pixel initiateCheckout', { pixelId: _pixelId, cartValue, currency })
  window.dispatchEvent(new CustomEvent('barion-pixel-event', { detail: { type: 'initiateCheckout', pixelId: _pixelId, cartValue, currency } }))
}

export async function initiatePurchase(orderId?: string, value?: number, currency?: string) {
  await ensureReady()
  if (!_pixelId) return

  try {
    const win: any = window
    if (win.Barion && typeof win.Barion.track === 'function') {
      win.Barion.track('initiatePurchase', { pixelId: _pixelId, orderId, value, currency })
      return
    }
  } catch (e) {
    // ignore
  }

  console.log('Barion pixel initiatePurchase', { pixelId: _pixelId, orderId, value, currency })
  window.dispatchEvent(new CustomEvent('barion-pixel-event', { detail: { type: 'initiatePurchase', pixelId: _pixelId, orderId, value, currency } }))
}

export async function trackPurchase(payload: { orderId?: string; value?: number; currency?: string; [k: string]: any }) {
  await ensureReady()
  if (!_pixelId) return

  try {
    const win: any = window
    if (win.Barion && typeof win.Barion.track === 'function') {
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
  grantConsent,
  setEncryptedEmail,
  contentView,
  addToCart,
  initiateCheckout,
  initiatePurchase,
  trackPurchase
}
