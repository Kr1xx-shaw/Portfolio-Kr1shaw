import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('./dist/assets/global-pointer.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/,'');
function setup(mouse,motion=false){
 const queries=new Map(),events={},stats={mounted:0,destroyed:0};
 const context={document:{createElement:()=>({setAttribute(){},style:{}}),body:{append(){}}},Object,
  matchMedia:q=>{const value={matches:q.includes('hover')?mouse:motion,addEventListener:(_,fn)=>value.change=fn};queries.set(q,value);return value},
  mountBlinkingSquares:()=>{stats.mounted++;return{destroy(){stats.destroyed++}}},addEventListener:(event,fn)=>events[event]=fn};
 vm.runInNewContext(source,context);
 return {stats,events,mouse:queries.get('(hover: hover) and (pointer: fine)'),motion:queries.get('(prefers-reduced-motion: reduce)')};
}
const touch=setup(false);assert.equal(touch.stats.mounted,0,'Touch devices must not allocate a foreground WebGL effect');
touch.events.pageshow();assert.equal(touch.stats.mounted,0);
const desktop=setup(true);assert.equal(desktop.stats.mounted,1);
desktop.mouse.matches=false;desktop.mouse.change();assert.equal(desktop.stats.destroyed,1);
desktop.mouse.matches=true;desktop.mouse.change();assert.equal(desktop.stats.mounted,2);
desktop.motion.matches=true;desktop.motion.change();assert.equal(desktop.stats.destroyed,2);
desktop.events.pageshow();assert.equal(desktop.stats.mounted,2);
assert.equal(setup(true,true).stats.mounted,0,'Reduced motion must not mount the pointer animation');
console.log('PASS: touch, mouse, input changes, reduced motion and page restore.');
