const { chromium } = require(require('node:path').resolve(__dirname, '../.browser-check/node_modules/playwright'));
const { spawn } = require('node:child_process');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../frontend');
(async () => {
 const dev = spawn(process.execPath, [path.join(root,'../node_modules/expo/bin/cli'),'start','--port','8098'], {cwd:root,env:{...process.env,CI:'1',EXPO_PUBLIC_API_URL:'http://127.0.0.1:4000'},stdio:['ignore','pipe','pipe']});
 let logs='';dev.stdout.on('data',d=>logs+=d);dev.stderr.on('data',d=>logs+=d);
 const server=http.createServer((req,res)=>{const file=path.join(root,'dist',decodeURIComponent(req.url.split('?')[0])==='/'?'index.html':req.url.split('?')[0]);try{res.setHeader('Content-Type',file.endsWith('.mjs')||file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end();}}).listen(8099,'127.0.0.1');
 let browser;
 try {
  browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for (let i=0;i<90;i++){try{if((await fetch('http://127.0.0.1:8098')).ok)break;}catch{} await new Promise(r=>setTimeout(r,500));}
  for(const port of [8098,8099]) {
   const page=await browser.newPage({viewport:{width:1100,height:850}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{localStorage.setItem('michipedia.session.v1',JSON.stringify({token:'test',user:{id:'507f1f77bcf86cd799439011',name:'Prueba',email:'test@example.com'}}));window.workerStats={messages:[],errors:[],parsedTiles:0};const Original=window.Worker;window.Worker=class extends Original{constructor(...args){super(...args);this.addEventListener('message',e=>{const json=JSON.stringify(e.data);window.workerStats.messages.push(json.slice(0,250));if(json.includes('"buckets":[{'))window.workerStats.parsedTiles++;});this.addEventListener('error',e=>window.workerStats.errors.push(e.message));}};});
   await page.route('**/api/auth/me',r=>r.fulfill({json:{user:{id:'507f1f77bcf86cd799439011',name:'Prueba',email:'test@example.com'}},headers:{'Access-Control-Allow-Origin':'*'}}));
   await page.route('https://tiles.openfreemap.org/styles/liberty',r=>r.fulfill({json:{version:8,sources:{fixture:{type:'geojson',data:{type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:{type:'Point',coordinates:[-58.3816,-34.6037]}}]}}},layers:[{id:'bg',type:'background',paint:{'background-color':'#eee'}},{id:'point',type:'circle',source:'fixture',paint:{'circle-radius':24,'circle-color':'#ff0000'}}]}}));
   await page.goto(`http://127.0.0.1:${port}`,{timeout:90000});
   await page.waitForFunction(()=>window.workerStats.parsedTiles>0,{},{timeout:60000});
   await page.waitForTimeout(1000);
   const stats=await page.evaluate(()=>window.workerStats);
   await page.locator('.maplibregl-canvas').waitFor();
   if(errors.length||stats.errors.length)throw Error(JSON.stringify({errors,stats}));
   console.log(JSON.stringify({port,errors,workerMessages:stats.messages.length,parsedTiles:stats.parsedTiles}));
   await page.close();
  }
 } catch(error){console.error(error);console.error(logs.slice(-1500));process.exitCode=1;} finally {await browser?.close();dev.kill();server.close();}
})();
