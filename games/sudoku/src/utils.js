// Allgemeine Helfer
export function deepClone(grid){return grid.map(r=>r.slice());}
export function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function range(n){return [...Array(n).keys()];}
export function formatTime(sec){const m=Math.floor(sec/60).toString().padStart(2,'0');const s=(sec%60).toString().padStart(2,'0');return `${m}:${s}`;}
export function choice(arr){return arr[Math.floor(Math.random()*arr.length)];}
export function computeBlockIndices(size,subR,subC){const blocks=[];for(let br=0;br<size;br+=subR){for(let bc=0;bc<size;bc+=subC){const cells=[];for(let r=0;r<subR;r++){for(let c=0;c<subC;c++){cells.push([br+r,bc+c]);}}blocks.push(cells);} }return blocks;}
export function candidatesFor(grid,size,subR,subC,row,col){if(grid[row][col]!==0)return [];const used=new Set();for(let c=0;c<size;c++){if(grid[row][c])used.add(grid[row][c]);}for(let r=0;r<size;r++){if(grid[r][col])used.add(grid[r][col]);}const br=Math.floor(row/subR)*subR;const bc=Math.floor(col/subC)*subC;for(let r=0;r<subR;r++){for(let c=0;c<subC;c++){const v=grid[br+r][bc+c];if(v)used.add(v);}}const res=[];for(let v=1;v<=size;v++){if(!used.has(v))res.push(v);}return res;}
export function findEmpty(grid){for(let r=0;r<grid.length;r++){for(let c=0;c<grid.length;c++){if(grid[r][c]===0)return [r,c];}}return null;}
