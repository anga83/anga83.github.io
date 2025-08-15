import {range, shuffle, deepClone, candidatesFor} from './utils.js';

// Simple deterministischer PRNG (Mulberry32)
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;}} 
function seededShuffle(arr,rng){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()* (i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
import {solveCount} from './solver.js';

// Erzeugt ein vollständiges Sudoku Board via Backtracking mit Randomisierung
export function generateFull(size,subR,subC,seedInt){const grid=Array.from({length:size},()=>Array(size).fill(0));const rng=seedInt!=null?mulberry32(seedInt):Math.random;function fillCell(idx){if(idx===size*size)return true;const r=Math.floor(idx/size);const c=idx%size;if(grid[r][c]!==0)return fillCell(idx+1);let cand=candidatesFor(grid,size,subR,subC,r,c);cand=seedInt!=null?seededShuffle(cand,rng):shuffle(cand);for(const v of cand){grid[r][c]=v;if(fillCell(idx+1))return true;grid[r][c]=0;}return false;}fillCell(0);return grid;}

// Entfernt Zellen basierend auf gewünschter Schwierigkeit & sorgt für Eindeutigkeit
export function carveUnique(full,size,subR,subC,difficulty,customClues,seedInt){const total=size*size;let clues;
switch(difficulty){
  case 'very-easy': clues=Math.max(Math.floor(total*0.55), size*subR); break;
  case 'easy': clues=Math.floor(total*0.5); break;
  case 'medium': clues=Math.floor(total*0.43); break;
  case 'hard': clues=Math.floor(total*0.37); break;
  case 'very-hard': clues=Math.floor(total*0.32); break;
  case 'custom': clues=Math.min(total-1, Math.max(5, customClues||Math.floor(total*0.4))); break;
  default: clues=Math.floor(total*0.5);
}
const rng=seedInt!=null?mulberry32(seedInt^0xABCDEF):Math.random;const grid=deepClone(full);const positions=seedInt!=null?seededShuffle(range(total),rng):shuffle(range(total));let removed=0;for(const pos of positions){const r=Math.floor(pos/size);const c=pos%size;const backup=grid[r][c];grid[r][c]=0;const solutions=solveCount(grid,size,subR,subC,2);if(solutions!==1){grid[r][c]=backup;}else{removed++;if(total-removed<=clues)break;}}
return grid;}

// Hash einer UUID -> 32-bit (FNV-1a Variante)
function hashUuid(uuid){let h=0x811c9dc5;for(let i=0;i<uuid.length;i++){h^=uuid.charCodeAt(i);h=Math.imul(h,0x01000193);h>>>0;}return h>>>0;}
function fallbackUUID(){// RFC4122 v4 ähnlich
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;const v=c==='x'?r:(r&0x3|0x8);return v.toString(16);});
}
export function generatePuzzle(size,subR,subC,difficulty,customClues,seedUuid){const uuid=seedUuid|| (typeof crypto!=='undefined' && crypto.randomUUID ? crypto.randomUUID():fallbackUUID());const seedInt=hashUuid(uuid);const full=generateFull(size,subR,subC,seedInt);const puzzle=carveUnique(full,size,subR,subC,difficulty,customClues,seedInt^0x9E3779B9);return {solution:full,puzzle,seed:uuid};}

export function defaultSubblocks(size){switch(size){case 4:return [2,2];case 6:return [2,3];case 9:return [3,3];case 12:return [3,4];default: // fallback quadratisch wenn möglich
  const r=Math.floor(Math.sqrt(size));for(let a=r;a>=2;a--){if(size%a===0){return [a,size/a];}}
  return [1,size];}}
