import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hero} from './fixture.mjs';
const hooks={};globalThis.Hooks={once:(k,f)=>hooks[k]=f,on:(k,f)=>hooks[k]=f};
let lastWindow;class App{constructor(){lastWindow=this;}render(){this.rendered=true;}bringToFront(){}}
const assign=(obj,key,value)=>{const keys=key.split('.');const tail=keys.pop();let p=obj;for(const k of keys)p=p[k]??={};if(tail.startsWith('-='))delete p[tail.slice(2)];else p[tail]=structuredClone(value);};
let count=0;globalThis.foundry={applications:{api:{ApplicationV2:App}},utils:{randomID:()=>`id${++count}`,expandObject:o=>{const out={};for(const [k,v]of Object.entries(o))assign(out,k,v);return out;}}};
const actors=new Map();let createPermission=true;
globalThis.game={system:{id:'worldbuilding'},modules:new Map([['saga-character-studio',{}]]),user:{id:'player',can:()=>createPermission},actors:{get:id=>actors.get(id),get contents(){return [...actors.values()];}}};
globalThis.ui={notifications:{info:()=>{},error:()=>{}}};globalThis.CONST={DOCUMENT_OWNERSHIP_LEVELS:{OWNER:3}};
function actor(data){return {...data,id:`a${++count}`,isOwner:true,getFlag(ns,key){return this.flags?.[ns]?.[key];},async setFlag(ns,key,v){assign(this,`flags.${ns}.${key}`,v);},async update(data){for(const [k,v]of Object.entries(data))assign(this,k,v);}};}
globalThis.Actor={create:async data=>{const a=actor(data);actors.set(a.id,a);return a;}};
await import('../module/scripts/module.js');hooks.ready();const api=game.modules.get('saga-character-studio').api;
test('create, reopen, edit same actor; conflicts and ownership checked',async()=>{
 api.open();const key=lastWindow.key;const saved=await api.save(key,hero);const a=actors.get(saved.id);assert.equal(a.prototypeToken.actorLink,true);assert.equal(a.ownership.player,3);assert.equal(a.getFlag('saga-character-studio','build').character.powers[0].description,'Test power');assert.equal(api.load(key,a.id).character.heroName,hero.heroName);
 a.prototypeToken.texture={src:'my-token.webp'};await api.save(key,{...hero,heroName:'Changed'});assert.equal(actors.size,1);assert.equal(a.prototypeToken.texture.src,'my-token.webp');
 a.system.biography='GM edit';await assert.rejects(api.save(key,hero),/changed/);api.load(key,a.id);a.isOwner=false;await assert.rejects(api.save(key,hero),/own/);a.isOwner=true;
});
test('legacy migration keeps backup, preserves health, token and unrelated fields',async()=>{
 const a=actor({name:'Legacy',img:'portrait.webp',system:{biography:'Original',health:{value:7,max:10},attributes:{Skills:{Old:{value:'1d6'}},Other:{custom:{value:2}}}},flags:{},prototypeToken:{texture:{src:'token.webp'}}});actors.set(a.id,a);api.open();const key=lastWindow.key;assert.equal(api.load(key,a.id).character,null);await api.save(key,hero);assert.equal(a.system.health.value,7);assert.equal(a.prototypeToken.texture.src,'token.webp');assert.equal(a.system.attributes.Other.custom.value,2);assert.equal(a.system.attributes.Skills.Old,undefined);assert.equal(a.getFlag('saga-character-studio','legacyBackup').system.biography,'Original');assert.equal(a.img,'portrait.webp');
});
test('creation permissions and session conflicts',async()=>{api.open();const key=lastWindow.key;api.reset(key);createPermission=false;await assert.rejects(api.save(key,hero),/cannot create/);createPermission=true;await api.save(key,hero);const old=api.session(key);await api.setSession(key,{heroism:2,conditions:[],rolls:[]},old);await assert.rejects(api.setSession(key,{heroism:3,conditions:[],rolls:[]},old),/changed/);assert.equal(api.session(key).heroism,2);});

test('sheet header opens the correct Actor, reuses its editor and checks ownership',()=>{
 const a=[...actors.values()][0];const buttons=[];
 hooks.getActorSheetHeaderButtons({actor:a},buttons);
 assert.equal(buttons[0].label,'Edit in SAGA');buttons[0].onclick();
 const first=lastWindow;assert.equal(api.initial(first.key),a.id);api.load(first.key,a.id);
 buttons[0].onclick();assert.equal(lastWindow,first);
 const b=[...actors.values()][1];api.open(b.id);assert.notEqual(lastWindow,first);assert.equal(api.initial(lastWindow.key),b.id);
 a.isOwner=false;const denied=[];hooks.getActorSheetHeaderButtons({actor:a},denied);assert.equal(denied.length,0);a.isOwner=true;
});
