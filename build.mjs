// Cloudflare uploads these files directly. Do not inline assets into a Worker.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const config=read('wrangler.toml');
assert.match(config,/^main\s*=\s*"worker\.mjs"\s*$/m,'Cloudflare must deploy worker.mjs');
const assets=config.match(/^\[assets\]\s*\n([\s\S]*?)(?=^\[|$(?![\s\S]))/m)?.[1]||'';
assert.match(assets,/^directory\s*=\s*"\.\/dist"\s*$/m);
assert.match(assets,/^binding\s*=\s*"ASSETS"\s*$/m);
assert.match(assets,/^html_handling\s*=\s*"none"\s*$/m);
assert.match(read('dist/.assetsignore'),/^\/?server\/\s*$/m,'Legacy bundle must not be uploaded as an asset');
execFileSync(process.execPath,['--check',path.join(root,'worker.mjs')],{stdio:'inherit'});

// Verify page entry dependencies without opening images, fonts or bundles.
const html=read('dist/index.html');
for(const match of html.matchAll(/(?:src|href)="(\/[^"?#]+)(?:[?#][^"]*)?"/g)){
 const name=path.resolve(root,'dist','.'+match[1]);
 assert.ok(name.startsWith(path.join(root,'dist')+path.sep),'Asset must stay inside dist');
 assert.ok(fs.statSync(name).isFile(),`Missing page asset: ${match[1]}`);
}
function countAssets(directory){
 return fs.readdirSync(directory,{withFileTypes:true}).reduce((count,entry)=>{
  if(entry.name==='server'||entry.name.startsWith('.'))return count;
  return count+(entry.isDirectory()?countAssets(path.join(directory,entry.name)):entry.isFile()?1:0);
 },0);
}
console.log(`Cloudflare build verified: worker.mjs + ${countAssets(path.join(root,'dist'))} static files; no generated server bundle needed.`);
