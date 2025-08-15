import {generatePuzzle, defaultSubblocks} from './generator.js';
// Boot-Flag für Fallback-Erkennung
window.__SUDOKU_BOOTED = true;
import {solve} from './solver.js';
import {formatTime} from './utils.js';
import {BoardUI} from './board.js';

const boardEl=document.getElementById('board');
const boardUI=new BoardUI(boardEl);

const sizeSelect=document.getElementById('sizeSelect');
const subblockSelect=document.getElementById('subblockSelect');
const difficultySelect=document.getElementById('difficultySelect');
const customWrapper=document.getElementById('customDifficultyWrapper');
const customCluesInput=document.getElementById('customClues');
const penBtn=document.getElementById('penModeBtn');
const noteBtn=document.getElementById('noteModeBtn');
const newBtn=document.getElementById('newBtn');
const resetBtn=document.getElementById('resetBtn');
const checkBtn=document.getElementById('checkBtn');
const cleanErrorsBtn=document.getElementById('cleanErrorsBtn');
const solveBtn=document.getElementById('solveBtn');
const autoCheck=document.getElementById('autoCheck');
const highlightSimilar=document.getElementById('highlightSimilar');
const statusMsg=document.getElementById('statusMsg');
const numberPad=document.getElementById('numberPad');
const timerEl=document.getElementById('timer');
const themeToggle=document.getElementById('themeToggle');
const rulesBtn=document.getElementById('rulesBtn');
const infoBtn=document.getElementById('infoBtn');
let currentSeed=null; // UUID String
function createUUID(){if(typeof crypto!=='undefined' && crypto.randomUUID) return crypto.randomUUID(); const rnd=()=>Math.random().toString(16).slice(2,6);return 'xxxxxxxxyxxx4xxx'.replace(/[xy4]/g,c=>{if(c==='4')return '4';const r=Math.random()*16|0;const v=c==='x'?r:(r&0x3|0x8);return v.toString(16);})+'-'+rnd()+rnd();}

// ---- Internationalisierung ----
const LOCALE=(navigator.language||navigator.userLanguage||'en').toLowerCase().startsWith('de')?'de':'en';
const I18N={
  de:{sizeLabel:'Größe:',subblocksLabel:'Unterblöcke:',difficultyLabel:'Schwierigkeit:',customCluesLabel:'Min. Hinweise',
      diffVeryEasy:'Sehr einfach',diffEasy:'Einfach',diffMedium:'Mittel',diffHard:'Schwer',diffVeryHard:'Sehr schwer',diffCustom:'Benutzerdefiniert',
      btnNew:'Neu',btnReset:'Zurücksetzen',btnCheck:'Prüfen',btnClean:'Fehler entfernen',btnSolve:'Lösen',
      autoCheckLabel:'Fehler automatisch prüfen',highlightSimilarLabel:'Gleiche Zahlen hervorheben',
      penMode:'Stift',noteMode:'Notiz',statusReady:'Bereit.',generating:'Generiere...',goodLuck:'Viel Erfolg!',resetDone:'Zurückgesetzt',
      noErrors:'Keine Fehler',errorsOne:'1 Fehler',errorsMany:'{n} Fehler',removedOne:'1 Fehler entfernt',removedMany:'{n} Fehler entfernt',removedNone:'Keine Fehler zum Entfernen',solvedPrefix:'Gelöst! Zeit: '},
  en:{sizeLabel:'Size:',subblocksLabel:'Sub-blocks:',difficultyLabel:'Difficulty:',customCluesLabel:'Min. clues',
      diffVeryEasy:'Very easy',diffEasy:'Easy',diffMedium:'Medium',diffHard:'Hard',diffVeryHard:'Very hard',diffCustom:'Custom',
      btnNew:'New',btnReset:'Reset',btnCheck:'Check',btnClean:'Clear errors',btnSolve:'Solve',
      autoCheckLabel:'Auto check errors',highlightSimilarLabel:'Highlight same numbers',
      penMode:'Pen',noteMode:'Notes',statusReady:'Ready.',generating:'Generating...',goodLuck:'Good luck!',resetDone:'Reset',
      noErrors:'No errors',errorsOne:'1 error',errorsMany:'{n} errors',removedOne:'1 error cleared',removedMany:'{n} errors cleared',removedNone:'No errors to clear',solvedPrefix:'Solved! Time: '}
};
function t(key,vars={}){const raw=(I18N[LOCALE]&&I18N[LOCALE][key])||key;return raw.replace(/\{(\w+)\}/g,(_,k)=>vars[k]??'');}
function applyI18n(){
  // labels with data-i18n-label
  document.querySelectorAll('[data-i18n-label]').forEach(l=>{const k=l.getAttribute('data-i18n-label');const txt=t(k);if(l.firstChild && l.firstChild.nodeType===3){l.firstChild.textContent=txt+' ';}else{l.insertBefore(document.createTextNode(txt+' '),l.firstChild);} });
  // simple elements
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.getAttribute('data-i18n'));});
  // difficulty options
  document.querySelectorAll('#difficultySelect option[data-i18n]').forEach(opt=>{opt.textContent=t(opt.getAttribute('data-i18n'));});
  statusMsg.textContent=t('statusReady');
}

// Theme Handling
const THEME_KEY='sudoku.theme';
function applyTheme(t){if(!t){document.documentElement.removeAttribute('data-theme');return;}document.documentElement.setAttribute('data-theme',t);}
function systemPref(){return window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
function initTheme(){const saved=localStorage.getItem(THEME_KEY);if(saved==='light' || saved==='dark'){applyTheme(saved);}else{applyTheme(systemPref());}}
themeToggle?.addEventListener('click',()=>{const current=document.documentElement.getAttribute('data-theme');let next;if(!current){next=systemPref()==='dark'?'light':'dark';}else{next=current==='dark'?'light':'dark';}
  applyTheme(next);localStorage.setItem(THEME_KEY,next);});
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',e=>{const saved=localStorage.getItem(THEME_KEY);if(!saved){applyTheme(e.matches?'dark':'light');}});

let timerInt=null;let seconds=0;let timerStarted=false;function startTimerInternal(){clearInterval(timerInt);timerInt=setInterval(()=>{seconds++;timerEl.textContent=formatTime(seconds);},1000);}function stopTimer(){clearInterval(timerInt);timerStarted=false;}
function resetTimerDisplay(){clearInterval(timerInt);seconds=0;timerStarted=false;timerEl.textContent='00:00';}

function populateSubblockOptions(size){subblockSelect.innerHTML='';const [defR,defC]=defaultSubblocks(size);const pairs=[[defR,defC]]; // generate alternative factorizations
for(let r=2;r<=size;r++){if(size%r===0){const c=size/r; if(r!==defR || c!==defC) pairs.push([r,c]);}}
for(const [r,c] of pairs){const opt=document.createElement('option');opt.value=`${r}x${c}`;opt.textContent=`${r}×${c}`;if(r===defR && c===defC)opt.selected=true;subblockSelect.appendChild(opt);} }

function buildNumberPad(size){numberPad.innerHTML='';for(let v=1;v<=size;v++){const btn=document.createElement('button');btn.textContent=boardUI.symbol(v);btn.dataset.value=v;btn.addEventListener('click',()=>{if(btn.disabled)return;boardUI.inputValue(v);afterChange();});numberPad.appendChild(btn);}const erase=document.createElement('button');erase.textContent='⌫';erase.classList.add('utility');erase.addEventListener('click',()=>{boardUI.erase();afterChange();});numberPad.appendChild(erase);}

function isNumberComplete(v){const {size,subR,subC,grid,solution}=boardUI.state;for(let br=0;br<size;br+=subR){for(let bc=0;bc<size;bc+=subC){let occ=0;let correct=false;for(let r=0;r<subR;r++){for(let c=0;c<subC;c++){const rr=br+r,cc=bc+c; if(grid[rr][cc]===v){occ++; if(solution[rr][cc]===v) correct=true;} }} if(occ!==1 || !correct) return false;}}return true;}

function updateNumberPad(){const size=boardUI.state.size;for(let v=1;v<=size;v++){const btn=numberPad.querySelector(`button[data-value='${v}']`);if(!btn)continue; if(isNumberComplete(v)){btn.classList.add('completed');btn.disabled=true;}else{btn.classList.remove('completed');btn.disabled=false;}}}

function ensureTimerStarted(){if(!timerStarted){timerStarted=true;startTimerInternal();}}
function afterChange(){ensureTimerStarted();checkSolved();updateNumberPad();}

function parseSubblockValue(){const [r,c]=subblockSelect.value.split('x').map(Number);return [r,c];}

function newGame(rawSeed){ // rawSeed kann von Event-Listener kommen
  const size=+sizeSelect.value;const [subR,subC]=parseSubblockValue();const difficulty=difficultySelect.value;const customClues=+customCluesInput.value;
  const seedFromLink = (typeof rawSeed==='string' && rawSeed.length>0) ? rawSeed : undefined; // alles Nicht-String verwerfen
  currentSeed = seedFromLink ?? createUUID();
  statusMsg.textContent=t('generating');resetTimerDisplay();
  setTimeout(()=>{const {puzzle,solution}=generatePuzzle(size,subR,subC,difficulty,customClues,currentSeed);boardUI.setup(size,subR,subC,puzzle,solution);buildNumberPad(size);boardUI.state.autoCheck=autoCheck.checked;boardUI.state.highlightSimilar=highlightSimilar.checked;statusMsg.textContent=t('goodLuck');updateNumberPad();},10);
}

function checkSolved(){const errors=boardUI.checkErrors();if(errors===0){const allFilled=boardUI.state.grid.every(row=>row.every(v=>v!==0));if(allFilled){statusMsg.textContent=t('solvedPrefix')+formatTime(seconds);stopTimer();}}
}

sizeSelect.addEventListener('change',()=>{populateSubblockOptions(+sizeSelect.value);newGame();});
subblockSelect.addEventListener('change',()=>newGame());
difficultySelect.addEventListener('change',()=>{customWrapper.classList.toggle('hidden',difficultySelect.value!=='custom');});
customCluesInput.addEventListener('change',()=>{if(difficultySelect.value==='custom')newGame();});

penBtn.addEventListener('click',()=>{boardUI.setMode('pen');penBtn.classList.add('active');noteBtn.classList.remove('active');});
noteBtn.addEventListener('click',()=>{boardUI.setMode('note');noteBtn.classList.add('active');penBtn.classList.remove('active');});
newBtn.addEventListener('click',()=>newGame());
resetBtn.addEventListener('click',()=>{boardUI.reset();statusMsg.textContent=t('resetDone');resetTimerDisplay();updateNumberPad();});
checkBtn.addEventListener('click',()=>{const errors=boardUI.checkErrors();if(errors===0)statusMsg.textContent=t('noErrors');else statusMsg.textContent=errors===1?t('errorsOne'):t('errorsMany',{n:errors});});
cleanErrorsBtn.addEventListener('click',()=>{const removed=boardUI.removeErrors();if(removed===0)statusMsg.textContent=t('removedNone');else statusMsg.textContent=removed===1?t('removedOne'):t('removedMany',{n:removed});});
solveBtn.addEventListener('click',()=>{const solved=solve(boardUI.state.grid,boardUI.state.size,boardUI.state.subR,boardUI.state.subC);boardUI.setup(boardUI.state.size,boardUI.state.subR,boardUI.state.subC,solved,solved);statusMsg.textContent=t('btnSolve');stopTimer();updateNumberPad();});
autoCheck.addEventListener('change',()=>boardUI.state.autoCheck=autoCheck.checked);
highlightSimilar.addEventListener('change',()=>{boardUI.state.highlightSimilar=highlightSimilar.checked;boardUI.highlightSameNumbers();});

document.addEventListener('keydown',e=>{if(!boardUI.state.selected)return;const k=e.key;if(/^[1-9]$/.test(k)){const v=+k;if(v<=boardUI.state.size){boardUI.inputValue(v);afterChange();}}
  else if(/^[a-zA-Z]$/.test(k)){const val=k.toUpperCase().charCodeAt(0)-55; // A->10
    if(val>=10 && val<=boardUI.state.size){boardUI.inputValue(val);afterChange();}}
  else if(k==='Backspace' || k==='Delete'){boardUI.erase();afterChange();}
  else if(k==='n' && e.ctrlKey){newGame();}
});

// init (erste URL-Einstellungen später angewendet)
initTheme();
applyI18n();

// ---- Popover Hilfsfunktionen ----
let openPopover=null;function closePopover(){if(openPopover){openPopover.remove();openPopover=null;}}
function showRules(){closePopover();const div=document.createElement('div');div.className='rules-bubble';div.style.position='absolute';div.innerHTML=(LOCALE==='de'?`<h3>Regeln</h3><ul><li>Jede Zahl (bzw. jedes Symbol) nur einmal pro Zeile.</li><li>Nur einmal pro Spalte.</li><li>Nur einmal pro Unterblock.</li><li>Notizen helfen Kandidaten festzuhalten.</li></ul>`:`<h3>Rules</h3><ul><li>Each symbol exactly once per row.</li><li>Once per column.</li><li>Once per sub-block.</li><li>Use notes to track candidates.</li></ul>`);document.body.appendChild(div);openPopover=div;document.addEventListener('click',outsideClose,{capture:true});}
function showLink(){closePopover();const link=buildGameLink();const div=document.createElement('div');div.className='link-bubble';div.style.position='absolute';div.innerHTML=`<div>${LOCALE==='de'?'Spiel-Link':'Game Link'}</div><input type="text" value="${link}" readonly><div class="actions"><button class="copyAct">${LOCALE==='de'?'Kopieren':'Copy'}</button></div>`;document.body.appendChild(div);const inp=div.querySelector('input');inp.select();const btn=div.querySelector('button.copyAct');btn.addEventListener('click',()=>{navigator.clipboard.writeText(link);btn.textContent=LOCALE==='de'?'Kopiert!':'Copied!';});openPopover=div;document.addEventListener('click',outsideClose,{capture:true});}
function outsideClose(ev){if(openPopover && !openPopover.contains(ev.target) && ev.target!==rulesBtn && ev.target!==infoBtn){closePopover();document.removeEventListener('click',outsideClose,true);}}

// ---- Rules Popover ----
rulesBtn.addEventListener('click',showRules);

// ---- Info Popover (Link) ----
function buildGameLink(){const params=new URLSearchParams();params.set('size',sizeSelect.value);params.set('sub',subblockSelect.value);params.set('diff',difficultySelect.value);if(currentSeed)params.set('seed',currentSeed);if(difficultySelect.value==='custom')params.set('clues',customCluesInput.value);return location.origin+location.pathname+'?'+params.toString();}
infoBtn.addEventListener('click',showLink);

// URL Parameter laden (Seed / Einstellungen)
function loadFromURL(){const qs=new URLSearchParams(location.search);const size=qs.get('size');const diff=qs.get('diff');const sub=qs.get('sub');const seedUuid=qs.get('seed');const clues=qs.get('clues');if(size && sizeSelect.querySelector(`option[value='${size}']`)) sizeSelect.value=size; if(diff && difficultySelect.querySelector(`option[value='${diff}']`)) difficultySelect.value=diff; if(sub){subblockSelect.value=sub;} if(clues) customCluesInput.value=clues; return seedUuid||undefined;}
const urlSeed=loadFromURL();
populateSubblockOptions(+sizeSelect.value);newGame(urlSeed);
