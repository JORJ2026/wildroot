// Copies the web build into www/ for Capacitor (Android and iOS). The service worker is not needed inside a native shell.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),www=path.join(root,'www');
fs.rmSync(www,{recursive:true,force:true});fs.mkdirSync(www,{recursive:true});
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace(/<meta name="wildroot-sw"[^>]*>\n?/,'');
fs.writeFileSync(path.join(www,'index.html'),html);
for(const f of ['manifest.webmanifest'])fs.copyFileSync(path.join(root,f),path.join(www,f));
fs.cpSync(path.join(root,'icons'),path.join(www,'icons'),{recursive:true});
console.log('www ready');
