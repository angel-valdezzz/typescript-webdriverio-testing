import { browser } from '@wdio/globals';
export const config = {
  runner:'local', specs:['./tests/**/*.spec.ts'], maxInstances:1,
  capabilities:[{browserName:'chrome','goog:chromeOptions':{args:['--headless=new','--no-sandbox','--disable-dev-shm-usage','--window-size=1440,900']}}],
  logLevel:'warn', framework:'mocha', mochaOpts:{timeout:90000}, waitforTimeout:20000,
  connectionRetryCount:0, reporters:['spec',['junit',{outputDir:'reports'}]],
  afterTest:async function(test,context,{passed}) { if(!passed) { const fs=await import('node:fs/promises'); await fs.mkdir('reports',{recursive:true}); await browser.saveScreenshot('reports/'+Date.now()+'.png'); } }
};
