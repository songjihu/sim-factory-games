'use strict';
function permitsTextEditing(target){return !!target?.closest?.('textarea,input:not([type="range"]),[contenteditable="true"]')}
function initControlInput(){
const preventSelection=e=>{if(!permitsTextEditing(e.target))e.preventDefault()};
document.addEventListener('contextmenu',preventSelection);
document.addEventListener('selectstart',preventSelection);
document.addEventListener('dragstart',preventSelection);
// Only held driving controls suppress pointer defaults; panels keep native scrolling.
document.addEventListener('pointerdown',e=>{if(permitsTextEditing(e.target))return;if(e.target?.closest?.('#stick,#hornflash')){e.preventDefault();window.getSelection?.()?.removeAllRanges()}},{capture:true,passive:false});
}
