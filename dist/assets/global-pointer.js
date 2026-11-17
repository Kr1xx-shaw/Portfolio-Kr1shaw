import {mountBlinkingSquares} from './pointer-squares.js?v=33-global-pointer';
const host=document.createElement('div');
host.setAttribute('aria-hidden','true');
Object.assign(host.style,{position:'fixed',inset:'0',pointerEvents:'none',overflow:'hidden',zIndex:'9990'});
document.body.append(host);
let effect;
function mount(){if(effect)return;effect=mountBlinkingSquares(host,{gridSize:160,squareSize:.6,dpr:1,maxFps:30,mouseInteraction:true,keyboardInteraction:false,introEnabled:false,minBrightness:.65,twinkleSpeed:.45,opacity:.22,interactionRadius:55,interactionStrength:1,densityBoost:.65,brightnessBoost:.15,pulseStrength:.45,pulseLift:.25,pulseSpeed:180,pulseDecay:.8,inertiaDuration:.3});}
mount();
addEventListener('pagehide',()=>{effect?.destroy();effect=null;});
addEventListener('pageshow',mount);
