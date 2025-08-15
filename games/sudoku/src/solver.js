import {findEmpty, candidatesFor, deepClone, shuffle} from './utils.js';

// Backtracking Solver; liefert Anzahl Lösungen (begrenzt >1)
export function solveCount(grid,size,subR,subC,limit=2){const g=deepClone(grid);let count=0;function bt(){if(count>=limit)return;const empty=findEmpty(g);if(!empty){count++;return;}const [r,c]=empty;const cand=candidatesFor(g,size,subR,subC,r,c);for(const v of cand){g[r][c]=v;bt();if(count>=limit)break;}g[r][c]=0;}bt();return count;}

export function solve(grid,size,subR,subC){const g=deepClone(grid);function bt(){const empty=findEmpty(g);if(!empty)return true;const [r,c]=empty;const cand=candidatesFor(g,size,subR,subC,r,c);for(const v of cand){g[r][c]=v;if(bt())return true;}g[r][c]=0;return false;}bt();return g;}

export function isSolved(grid){return grid.every(row=>row.every(v=>v!==0));}
