'use strict';
const {app,BrowserWindow,Menu,shell}=require('electron');
const path=require('path'),fs=require('fs');

// Smoother canvas rendering on most machines
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');

if(!app.requestSingleInstanceLock()){app.quit();}

let win=null;
const stateFile=()=>path.join(app.getPath('userData'),'window.json');
const loadState=()=>{try{return JSON.parse(fs.readFileSync(stateFile(),'utf8'))}catch(e){return {}}};
const saveState=()=>{try{if(!win||win.isDestroyed())return;const b=win.getNormalBounds();fs.writeFileSync(stateFile(),JSON.stringify({...b,full:win.isFullScreen(),max:win.isMaximized()}))}catch(e){}};

function create(){
  const s=loadState();
  win=new BrowserWindow({
    width:s.width||1280,height:s.height||800,x:s.x,y:s.y,minWidth:640,minHeight:400,
    backgroundColor:'#0c120a',title:'Wildroot',show:false,autoHideMenuBar:true,
    icon:path.join(__dirname,'..','icons','icon-512.png'),
    webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false,spellcheck:false}
  });
  if(process.platform==='darwin'){
    Menu.setApplicationMenu(Menu.buildFromTemplate([{role:'appMenu'},{role:'editMenu'},{role:'viewMenu'},{role:'windowMenu'}]));
  }else{Menu.setApplicationMenu(null);}
  win.loadFile(path.join(__dirname,'..','index.html'));
  win.once('ready-to-show',()=>{if(s.max)win.maximize();if(s.full)win.setFullScreen(true);win.show();});
  win.webContents.setWindowOpenHandler(({url})=>{if(/^https?:/i.test(url))shell.openExternal(url);return {action:'deny'};});
  win.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith('file:')){e.preventDefault();if(/^https?:/i.test(url))shell.openExternal(url);}});
  win.webContents.on('before-input-event',(e,i)=>{if(i.type==='keyDown'&&i.key==='F11'){win.setFullScreen(!win.isFullScreen());e.preventDefault();}});
  win.on('close',saveState);
  win.on('closed',()=>{win=null;});
}
app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.focus();}});
app.whenReady().then(()=>{create();app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)create();});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
