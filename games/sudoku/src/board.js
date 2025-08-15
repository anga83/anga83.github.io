import {candidatesFor} from './utils.js';

export class BoardUI{
  constructor(root){this.root=root;this.state={size:9,subR:3,subC:3,grid:[],solution:[],notes:new Map(),selected:null,mode:'pen',autoCheck:false,highlightSimilar:true};}
  setup(size,subR,subC,puzzle,solution){this.state.size=size;this.state.subR=subR;this.state.subC=subC;this.state.grid=puzzle.map(r=>r.slice());this.state.solution=solution;this.state.notes.clear();this.state.selected=null;this.render();}
  cellId(r,c){return `r${r}c${c}`;}
  parseId(id){const m=/r(\d+)c(\d+)/.exec(id);return m?[+m[1],+m[2]]:null;}
  render(){const {size,subR,subC}=this.state;this.root.style.setProperty('--size',size);const frag=document.createDocumentFragment();this.root.innerHTML='';for(let r=0;r<size;r++){for(let c=0;c<size;c++){const v=this.state.grid[r][c];const div=document.createElement('div');div.className='cell';div.id=this.cellId(r,c);if(v!==0){div.textContent=this.symbol(v);div.classList.add('prefilled');div.setAttribute('data-value',v);}else{div.setAttribute('data-value','');}
        const noteWrapper=document.createElement('div');noteWrapper.className='notes';div.appendChild(noteWrapper);
        if(size<=6 && (subR===2||subC===2))div.classList.add('small-grid-2');
  // Blockbegrenzungen via Klassen
  if(c%subC===0)div.classList.add('blkL');
  if(r%subR===0)div.classList.add('blkT');
  if(c===size-1)div.classList.add('blkR');
  if(r===size-1)div.classList.add('blkB');
        div.addEventListener('click',()=>this.handleSelect(r,c));
        frag.appendChild(div);
      }}this.root.appendChild(frag);}  
  symbol(v){if(this.state.size<=9)return v.toString();const chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';return chars[v];}
  isPrefilled(r,c){return this.state.solution[r][c]===this.state.grid[r][c] && this.state.grid[r][c]!==0;}
  handleSelect(r,c){this.state.selected=[r,c];this.updateSelectionHighlight();if(this.state.highlightSimilar){this.highlightSameNumbers();}}
  updateSelectionHighlight(){this.root.querySelectorAll('.cell').forEach(el=>el.removeAttribute('aria-selected'));if(!this.state.selected)return;const [r,c]=this.state.selected;const el=document.getElementById(this.cellId(r,c));if(el)el.setAttribute('aria-selected','true');}
  highlightSameNumbers(){this.root.querySelectorAll('.cell').forEach(el=>el.classList.remove('same-number'));if(!this.state.selected)return;const [r,c]=this.state.selected;const val=this.state.grid[r][c];if(!val)return;this.root.querySelectorAll('.cell').forEach(el=>{if(el.textContent===this.symbol(val))el.classList.add('same-number');});}
  setMode(mode){this.state.mode=mode;}
  clearErrors(){this.root.querySelectorAll('.cell.error').forEach(el=>el.classList.remove('error'))}
  listErrors(){const coords=[];const {size}=this.state;for(let r=0;r<size;r++){for(let c=0;c<size;c++){const v=this.state.grid[r][c];if(v!==0 && v!==this.state.solution[r][c])coords.push([r,c]);}}return coords;}
  checkErrors(){this.clearErrors();const errs=this.listErrors();for(const [r,c] of errs){document.getElementById(this.cellId(r,c)).classList.add('error');}return errs.length;}
  removeErrors(){const errs=this.listErrors();for(const [r,c] of errs){if(!this.isPrefilled(r,c)){this.state.grid[r][c]=0;this.state.notes.delete(this.cellId(r,c));this.renderCell(r,c);} }
    this.clearErrors();return errs.length;}
  reset(preserveBoard=true){const {size}=this.state;for(let r=0;r<size;r++){for(let c=0;c<size;c++){if(!this.isPrefilled(r,c)){this.state.grid[r][c]=0;}}}
    this.state.notes.clear();this.render();}
  inputValue(value){if(!this.state.selected)return;const [r,c]=this.state.selected;if(this.isPrefilled(r,c))return; if(this.state.mode==='pen'){this.state.grid[r][c]=value;this.state.notes.delete(this.cellId(r,c));this.renderCell(r,c);}else{ // note mode
      const id=this.cellId(r,c);let set=this.state.notes.get(id);if(!set)set=new Set();if(set.has(value))set.delete(value);else set.add(value);this.state.notes.set(id,set);this.renderNotes(r,c,set);}if(this.state.autoCheck){this.clearErrors();this.checkErrors();}if(this.state.highlightSimilar)this.highlightSameNumbers();}
  erase(){if(!this.state.selected)return;const [r,c]=this.state.selected;if(this.isPrefilled(r,c))return;this.state.grid[r][c]=0;this.state.notes.delete(this.cellId(r,c));this.renderCell(r,c);}
  renderCell(r,c){const el=document.getElementById(this.cellId(r,c));if(!el)return;const v=this.state.grid[r][c];el.classList.remove('error');if(v){el.textContent=this.symbol(v);el.setAttribute('data-value',v);}
    else{el.textContent='';el.setAttribute('data-value','');const noteWrapper=document.createElement('div');noteWrapper.className='notes';el.innerHTML='';el.appendChild(noteWrapper);}
    // restore notes if exist
    const id=this.cellId(r,c);if(this.state.notes.has(id) && v===0){this.renderNotes(r,c,this.state.notes.get(id));}}
  renderNotes(r,c,set){const el=document.getElementById(this.cellId(r,c));if(!el)return;const note=el.querySelector('.notes');if(!note)return;note.innerHTML='';const maxSide=this.state.size<=6?2:3;for(let v=1;v<=this.state.size;v++){if(set.has(v)){const span=document.createElement('span');span.textContent=this.symbol(v);note.appendChild(span);}else{const span=document.createElement('span');span.textContent='';note.appendChild(span);}if((v)%maxSide===0){}
    }
  }
}
