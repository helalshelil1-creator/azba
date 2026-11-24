/**
 * Netlify Function: AZBA API (Nest + Express) behind serverless-http.
 * Same AppModule/config as main.ts via apps/api/dist/vercel-entry (getApp).
 * Requests arrive as /api/* (netlify.toml rewrite), Nest keeps its /api prefix.
 */
const serverless = require('serverless-http')

let handlerPromise = null
function getHandler() {
  if (!handlerPromise) {
    handlerPromise = require('../../apps/api/dist/vercel-entry')
      .getApp()
      .then((app) => serverless(app, { binary: ['application/octet-stream', 'image/*', 'application/pdf'] }))
  }
  return handlerPromise
}

exports.handler = async (event, context) => {
  // Netlify rewrites keep the original URL in rawUrl; make Express see /api/...
  if (event.rawUrl) {
    const u = new URL(event.rawUrl)
    event.path = u.pathname
  }
  const handler = await getHandler()
  return handler(event, context)
}
