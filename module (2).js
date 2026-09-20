import {ID,validate,project,legacy,conditionFormula} from './rules.mjs';
const sessions=new Map();
const copy=x=>JSON.parse(JSON.stringify(x));
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stamp=a=>JSON.stringify({name:a.name,img:a.img,system:a.system,build:a.getFlag(ID,'build')});
function owned(id){const a=game.actors.get(id);if(!a||!a.isOwner)throw Error('You must own this world Actor.');return a;}
function getSession(key){const s=sessions.get(key);if(!s)throw Error('This editor session has closed.');return s;}
class SagaWindow extends foundry.applications.api.ApplicationV2 {
 static DEFAULT_OPTIONS={id:'saga-character-studio',classes:['saga-studio'],window:{title:'SAGA Character Studio',resizable:true},position:{width:1100,height:820}};
 async _renderHTML(){const f=document.createElement('iframe');f.title='SAGA Character Studio';f.src=foundry.utils.getRoute(`modules/${ID}/app/index.html?session=${this.key}`);return f;}
 _replaceHTML(result,content){content.replaceChildren(result);}
 async close(options){if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Close SAGA Studio?'},content:'<p>Unsaved character edits will be lost. Close the editor?</p>'}))return this; sessions.delete(this.key);return super.close(options);}
}
let app;
const api={
 open(){if(game.system.id!=='worldbuilding')return ui.notifications.error('SAGA Studio requires Simple Worldbuilding.');if(app?.rendered){app.bringToFront();return;}app=new SagaWindow();app.key=foundry.utils.randomID();sessions.set(app.key,{actorId:null,base:null});app.render(true);},
 list(){return game.actors.contents.filter(a=>a.type==='character'&&a.isOwner).map(a=>({id:a.id,name:a.name,managed:!!a.getFlag(ID,'build')}));},
 load(key,id){const s=getSession(key);const a=owned(id);s.actorId=id;s.base=stamp(a);const build=a.getFlag(ID,'build');if(build?.schemaVersion>1)throw Error('This character was saved by a newer SAGA Studio version. Update the module before editing.');return {character:build?copy(build.character):null,legacy:build?null:legacy(a),name:a.name};},
 reset(key){const s=getSession(key);s.actorId=null;s.base=null;},
 async save(key,character){const s=getSession(key);if(s.busy)throw Error('A save is already in progress.');s.busy=true;try{
  const c=copy(validate(character));let a=s.actorId?owned(s.actorId):null;
  if(a&&stamp(a)!==s.base)throw Error('This Actor changed after you opened it. Export your .sagaChar progress, reopen the Actor, then reapply your changes.');
  if(!a&&!game.user.can('ACTOR_CREATE'))throw Error('You cannot create Actors. Ask the GM to create a blank character and give you Owner permission, then open it here.');
  let img=c.characterImage;
  if(!img&&a?.img){img=a.img;c.characterImage=img;}
  if(img?.startsWith('data:')){
   if(!game.user.can('FILES_UPLOAD'))throw Error('Portrait upload requires File Upload permission. Ask the GM to upload it, or use a character with an existing portrait.');
   if(!/^data:image\/(png|jpeg|webp|gif);base64,/.test(img))throw Error('Use a PNG, JPEG, WebP or GIF portrait.');
   const response=await fetch(img);const blob=await response.blob();if(blob.size>10*1024*1024)throw Error('Portrait must be smaller than 10 MB.');
   const ext=blob.type.split('/')[1];const path=`worlds/${game.world.id}`;
   const result=await foundry.applications.apps.FilePicker.upload('data',path,new File([blob],`saga-${foundry.utils.randomID()}.${ext}`,{type:blob.type}),{}, {notify:false});
   if(!result?.path)throw Error('Portrait upload failed.');img=result.path;c.characterImage=img;
  }
  const attrs=project(c);const update={name:c.heroName,'system.biography':c.characterBackstory||'',[`flags.${ID}.build`]:{schemaVersion:1,character:c}};
  if(img)update.img=img;
  for(const group of ['Attibutes','Skills','Powers']){
   for(const k of Object.keys(a?.system.attributes?.[group]||{}))if(!(k in attrs[group]))update[`system.attributes.${group}.-=${k}`]=null;
   for(const [k,v]of Object.entries(attrs[group]))update[`system.attributes.${group}.${k}`]=v;
   update[`system.groups.${group}`]={key:group,label:'',dtype:'String'};
  }
  if(a){if(!a.getFlag(ID,'build'))update[`flags.${ID}.legacyBackup`]={system:copy(a.system),name:a.name,img:a.img};await a.update(update);}
  else{const data=foundry.utils.expandObject(update);data.type='character';data.ownership={[game.user.id]:CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER};data.prototypeToken={name:c.heroName,actorLink:true,disposition:1,...(img?{texture:{src:img}}:{})};a=await Actor.create(data);s.actorId=a.id;}
  s.base=stamp(a);ui.notifications.info(`Saved ${a.name}`);return {id:a.id,name:a.name,character:c};
 }finally{s.busy=false;}},
 session(key){const s=getSession(key);return s.actorId?copy(owned(s.actorId).getFlag(ID,'session')||{heroism:1,conditions:[],rolls:[]}):{heroism:1,conditions:[],rolls:[]};},
 async setSession(key,data,expected){const s=getSession(key);if(!s.actorId)throw Error('Save the character to Foundry before using Play Mode.');const a=owned(s.actorId);const current=a.getFlag(ID,'session')||{heroism:1,conditions:[],rolls:[]};if(JSON.stringify(current)!==JSON.stringify(expected))throw Error('Play state changed in another window. Return to Summary, then reopen Play Mode.');await a.setFlag(ID,'session',copy(data));},
 async roll(key,label,die,modifier,conditions,flat){const s=getSession(key);if(!s.actorId)throw Error('Save the character to Foundry before rolling.');const a=owned(s.actorId);if(!/^1d(4|6|8|10|12|20|100)$/.test(die)||!Number.isFinite(modifier))throw Error('Invalid roll.');const r=await new Roll(`${die}+${modifier}${flat?'':conditionFormula(conditions)}`).evaluate();await r.toMessage({speaker:ChatMessage.getSpeaker({actor:a}),flavor:escape(label)}, {rollMode:game.settings.get('core','rollMode')});return {total:r.total,dieRoll:r.dice[0].results[0].result,dieMax:r.dice[0].faces,formula:r.formula};}
};
Hooks.once('ready',()=>{game.modules.get(ID).api=api;});
function button(_app,html){if(game.system.id!=='worldbuilding')return;const el=html instanceof HTMLElement?html:html?.[0];if(!el||el.querySelector('.saga-launch'))return;const target=el.querySelector('.directory-header')||el;const b=document.createElement('button');b.type='button';b.className='saga-launch';b.textContent='SAGA Character Studio';b.onclick=()=>api.open();target.append(b);}
Hooks.on('renderActorDirectory',button);
Hooks.on('getSceneControlButtons',controls=>{if(game.system.id!=='worldbuilding')return;const tokens=controls.tokens;if(tokens?.tools)tokens.tools.sagaStudio={name:'sagaStudio',title:'SAGA Character Studio',icon:'fa-solid fa-hat-wizard',button:true,onChange:()=>api.open()};});
