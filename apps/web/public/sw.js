// عامل خدمة بسيط لتفعيل تثبيت التطبيق فقط.
// لا يخزن أي صفحة أو طلب (لا بيانات دخول ولا استجابات API) ولا يعترض الشبكة.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {})
