import {shuffle, range, deepClone, createRng} from './utils.js';

// Grid cell: { value:'', fixed:false }
export function emptyGrid(size){return Array.from({length:size},()=>Array.from({length:size},()=>({value:'',fixed:false})));}

function count(line,v){return line.filter(c=>c.value===v).length;}
function adjacencyOk(line){let run=0,last='';for(const c of line){if(!c.value){run=0;last='';continue;}if(c.value===last){run++;if(run>=3)return false;}else{last=c.value;run=1;}}return true;}
function balanceOk(line){const size=line.length;const s=count(line,'S');const m=count(line,'M');if(s>size/2||m>size/2)return false;return true;}
function constraintsOk(grid,constraints){for(const c of constraints){const a=grid[c.a[0]][c.a[1]].value;const b=grid[c.b[0]][c.b[1]].value;if(!a||!b)continue;if(c.kind==='eq' && a!==b)return false;if(c.kind==='neq' && a===b)return false;}return true;}

function partialValid(grid,constraints){const n=grid.length;for(let i=0;i<n;i++){const row=grid[i];const col=grid.map(r=>r[i]);if(!adjacencyOk(row)||!adjacencyOk(col))return false;if(!balanceOk(row)||!balanceOk(col))return false;}return constraintsOk(grid,constraints);}

export function solve(grid,constraints,stopAfterSecond=true){const size=grid.length;const cells=grid;const solutions=[];function dfs(pos=0){if(solutions.length>(stopAfterSecond?1:Infinity))return;if(pos===size*size){ // full
 for(let i=0;i<size;i++){if(count(cells[i],'S')!==size/2||count(cells[i],'M')!==size/2)return;}for(let i=0;i<size;i++){const col=cells.map(r=>r[i]);if(count(col,'S')!==size/2||count(col,'M')!==size/2)return;}solutions.push(deepClone(cells));return;}
 const r=Math.floor(pos/size);const c=pos%size;if(cells[r][c].value){dfs(pos+1);return;}
 for(const v of ['S','M']){cells[r][c].value=v;if(partialValid(cells,constraints))dfs(pos+1);cells[r][c].value=''; if(solutions.length>(stopAfterSecond?1:Infinity))break;}
 }
 dfs();return solutions;}

export function generate(size=6,difficulty='medium',seed=null){if(size%2!==0)throw new Error('Size muss gerade sein');
 const baseSeed = seed || `${size}-${difficulty}`;
 const rng = createRng(baseSeed);
 function r(){return rng();}
 const grid=emptyGrid(size);const constraints=[]; // später
 // fill full solution first
 function fill(pos=0){if(pos===size*size)return true;const rIdx=Math.floor(pos/size);const cIdx=pos%size;if(grid[rIdx][cIdx].value){return fill(pos+1);}const order=shuffle(['S','M'],r);for(const v of order){grid[rIdx][cIdx].value=v;if(partialValid(grid,constraints)){if(rowFull(rIdx)&&count(grid[rIdx],'S')!==size/2)continue;if(colFull(cIdx)&&count(grid.map(row=>row[cIdx]),'S')!==size/2)continue;if(fill(pos+1))return true;}}grid[rIdx][cIdx].value='';return false;}
 function rowFull(r){return grid[r].every(c=>c.value);}function colFull(c){return grid.every(r=>r[c].value);}fill();
 // generate constraints random referencing solution values
 const constraintDensity = difficulty==='easy'?0.24: difficulty==='medium'?0.18:0.12;
 for(let rr=0;rr<size;rr++)for(let cc=0;cc<size;cc++){
  if(cc<size-1 && r()<constraintDensity){constraints.push({kind:grid[rr][cc].value===grid[rr][cc+1].value?'eq':'neq',a:[rr,cc],b:[rr,cc+1]});}
  if(rr<size-1 && r()<constraintDensity){constraints.push({kind:grid[rr][cc].value===grid[rr+1][cc].value?'eq':'neq',a:[rr,cc],b:[rr+1,cc]});}
 }
 // carve clues
 const full=deepClone(grid);
 const targetRatio = difficulty==='easy'?0.45: difficulty==='medium'?0.33:0.24; const minGiven=Math.round(size*size*targetRatio);
 const cellsIdx=shuffle(range(size*size),r);
 for(const idx of cellsIdx){const rr=Math.floor(idx/size);const cc=idx%size;const backup=grid[rr][cc].value;grid[rr][cc].value='';grid[rr][cc].fixed=false;const sols=solve(grid,constraints,true);const given=grid.flat().filter(c=>c.value).length;if(sols.length!==1 || given<minGiven){grid[rr][cc].value=backup;grid[rr][cc].fixed=true;} }
 for(let r=0;r<size;r++)for(let c=0;c<size;c++)if(grid[r][c].value)grid[r][c].fixed=true;
 return {grid: grid.map(r=>r.map(c=>({...c}))), solution: full.map(r=>r.map(c=>({...c}))), constraints, size, difficulty, seed: baseSeed};}
