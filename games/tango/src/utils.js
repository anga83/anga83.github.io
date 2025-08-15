export function deepClone(grid){return grid.map(r=>r.map(c=>({...c})));} 
export function range(n){return [...Array(n).keys()];}

// Hash string -> seed (xmur3 simplified)
function hashSeed(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19;}return ()=>{h=Math.imul(h^ (h>>>16),2246822507);h=Math.imul(h^ (h>>>13),3266489909);return (h^ (h>>>16))>>>0;};}
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}}
export function createRng(seedStr){const h=hashSeed(seedStr)();return mulberry32(h);} 
export function shuffle(arr,rng=Math.random){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
