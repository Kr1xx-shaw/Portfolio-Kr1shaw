import {mountBlinkingSquares as mountHomeSquares} from './home-riso-squares.js?v=33-global-pointer';
import {mountBlinkingSquares} from './riso-squares.js?v=33-global-pointer';
export function mountPaperBackground(host,{home=false}={}){
 const effect=(home?mountHomeSquares:mountBlinkingSquares)(host,{mouseInteraction:false,keyboardInteraction:false,gridSize:125,squareSize:.60,fadeStart:0,fadeEnd:1,dpr:1,maxFps:30,minBrightness:.16,twinkleSpeed:.45,twinkleStrength:.94,opacity:.62,backgroundColor:'#ffffff',squareColor:'#002fa7',introIntensity:.35,interactionStrength:.55,densityBoost:.16,brightnessBoost:.3,pulseStrength:.45,pulseLift:.35});
 return ()=>effect.destroy();
}
