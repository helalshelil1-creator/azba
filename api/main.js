/**
 * نقطة دخول ثابتة لكل طلبات /api/* — 'application كله في dist/vercel-entry.js.
 * المسار الحقيقي بيوصل في الهيدر x-azba-route (انظر lib/api.ts في الواجهة).
 */
const mod = require('../apps/api/dist/vercel-entry.js')
module.exports = mod.default || mod
