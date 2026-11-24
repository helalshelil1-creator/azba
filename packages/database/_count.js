
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const u = await p.user.count();
  const pr = await p.project.count();
  const s = await p.projectShare.count();
  console.log(JSON.stringify({users:u, projects:pr, shares:s}));
  await p.$disconnect();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
