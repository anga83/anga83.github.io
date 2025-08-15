export class TangoBoardUI {
  constructor(root){this.root=root;this.state={size:6,grid:[],solution:[],constraints:[],selected:null,autoCheck:false,showConstraintSymbols:false};}
  setup(puzzle){this.state.size=puzzle.size;this.state.grid=puzzle.grid.map(r=>r.map(c=>({...c})));this.state.solution=puzzle.solution.map(r=>r.map(c=>({...c})));this.state.constraints=puzzle.constraints;this.state.selected=null;this.render();}
  cellId(r,c){return `r${r}c${c}`;}
  parseId(id){const m=/r(\d+)c(\d+)/.exec(id);return m?[+m[1],+m[2]]:null;}
  render(){const size=this.state.size;this.root.style.setProperty('--size',size);this.root.innerHTML='';const frag=document.createDocumentFragment();for(let r=0;r<size;r++){for(let c=0;c<size;c++){const cell=this.state.grid[r][c];const div=document.createElement('div');div.className='cell tango-cell';div.id=this.cellId(r,c);div.dataset.value=cell.value||'';if(cell.fixed)div.classList.add('prefilled');const inner=document.createElement('div');inner.className='inner';const symbol = cell.value==='S'?'☀️': cell.value==='M'?'🌙':'';inner.textContent=symbol;if(cell.value==='M')inner.classList.add('moon-enhanced');div.appendChild(inner);div.addEventListener('click',()=>this.toggle(r,c));frag.appendChild(div);} }this.root.appendChild(frag);this.applyConstraintVisuals();}
  applyConstraintVisuals(){
    // clear previous inline borders & symbols
    this.root.querySelectorAll('.tango-cell').forEach(el=>{el.style.borderLeft='';el.style.borderTop='';});
    this.root.querySelectorAll('.constraint-symbol').forEach(el=>el.remove());
    const {constraints,showConstraintSymbols}=this.state;
    if(!constraints || !constraints.length)return;
    if(showConstraintSymbols){
      const cellSize = this.root.querySelector('.tango-cell')?.offsetWidth || 0;
      for(const c of constraints){
        const [ar,ac]=c.a;const [br,bc]=c.b;const aEl=document.getElementById(this.cellId(ar,ac));const bEl=document.getElementById(this.cellId(br,bc));if(!aEl||!bEl)continue;
        const sym=document.createElement('div');sym.className='constraint-symbol '+(c.kind==='neq'?'neq':'eq');sym.textContent=c.kind==='eq'? '=':'×';
        // midpoint via offsets (root is position:relative)
        const midX=(aEl.offsetLeft + bEl.offsetLeft + aEl.offsetWidth)/2 - 9; // center - half symbol
        const midY=(aEl.offsetTop + bEl.offsetTop + aEl.offsetHeight)/2 - 9;
        sym.style.left=midX+'px';sym.style.top=midY+'px';
        this.root.appendChild(sym);
      }
    } else {
      for(const c of constraints){const [ar,ac]=c.a;const [br,bc]=c.b;const style = c.kind==='eq'? '4px solid var(--c-accent)': '4px dashed #f97316';
        if(ar===br){const right=document.getElementById(this.cellId(br,bc));if(right)right.style.borderLeft=style;}
        else if(ac===bc){const bottom=document.getElementById(this.cellId(br,bc));if(bottom)bottom.style.borderTop=style;}
      }
    }
  }
  toggleConstraintMode(){this.state.showConstraintSymbols=!this.state.showConstraintSymbols; // Re-render to ensure clean base
    this.render();}
  toggle(r,c){const cell=this.state.grid[r][c];if(cell.fixed)return;cell.value= cell.value===''?'S': cell.value==='S'?'M':'';const el=document.getElementById(this.cellId(r,c));el.dataset.value=cell.value;const inner=el.querySelector('.inner');inner.classList.remove('moon-enhanced');inner.textContent=cell.value==='S'?'☀️': cell.value==='M'?'🌙':'';if(cell.value==='M')inner.classList.add('moon-enhanced');if(this.state.autoCheck){this.clearErrors();this.checkErrors();}}
  clearErrors(){this.root.querySelectorAll('.tango-cell.error').forEach(el=>el.classList.remove('error'));}
  listErrors(){const errs=[];const size=this.state.size;const grid=this.state.grid; // adjacency & balance overfill & constraints
    for(let i=0;i<size;i++){const row=grid[i];const col=grid.map(r=>r[i]);if(!this.adjOk(row))this.markLine(row,i,'row',errs);if(!this.adjOk(col))this.markLine(col,i,'col',errs);if(!this.balanceOk(row))this.markLine(row,i,'row',errs);if(!this.balanceOk(col))this.markLine(col,i,'col',errs);}for(const c of this.state.constraints){const a=grid[c.a[0]][c.a[1]].value;const b=grid[c.b[0]][c.b[1]].value;if(a&&b){if(c.kind==='eq'&&a!==b)errs.push([c.a[0],c.a[1]],[c.b[0],c.b[1]]);if(c.kind==='neq'&&a===b)errs.push([c.a[0],c.a[1]],[c.b[0],c.b[1]]);}}
    return errs;}
  markLine(line,index,type,errs){line.forEach((_,j)=>{const r= type==='row'?index:j;const c= type==='row'?j:index;errs.push([r,c]);});}
  adjOk(line){let run=0,last='';for(const c of line){if(!c.value){run=0;last='';continue;}if(c.value===last){run++;if(run>=3)return false;}else{last=c.value;run=1;}}return true;}
  balanceOk(line){const size=line.length;const s=line.filter(c=>c.value==='S').length;const m=line.filter(c=>c.value==='M').length; if(s>size/2||m>size/2)return false; return true;}
  checkErrors(){const errs=this.listErrors();for(const [r,c] of errs){const el=document.getElementById(this.cellId(r,c));el.classList.add('error');}return errs.length;}
  removeErrors(){const errs=this.listErrors();const unique=new Set(errs.map(e=>e.join(',')));let removed=0;for(const key of unique){const [r,c]=key.split(',').map(Number);const cell=this.state.grid[r][c];if(!cell.fixed && cell.value!==this.state.solution[r][c].value){cell.value='';removed++;}}
    this.render();return removed;}
  reset(){for(let r=0;r<this.state.size;r++)for(let c=0;c<this.state.size;c++)if(!this.state.grid[r][c].fixed)this.state.grid[r][c].value='';this.render();}
  isComplete(){return this.state.grid.every(row=>row.every(c=>c.value));}
}
