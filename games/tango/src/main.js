import {generate} from './generator.js';
import {TangoBoardUI} from './board.js';
window.__TANGO_BOOTED=true;document.documentElement.setAttribute('data-tango-loaded','1');

// Elements
const boardEl=document.getElementById('board');
const sizeSelect=document.getElementById('sizeSelect');
const difficultySelect=document.getElementById('difficultySelect');
const newBtn=document.getElementById('newBtn');
const dailyBtn=document.getElementById('dailyBtn');
const resetBtn=document.getElementById('resetBtn');
const checkBtn=document.getElementById('checkBtn');
const cleanErrorsBtn=document.getElementById('cleanErrorsBtn');
const constraintStyleBtn=document.getElementById('constraintStyleBtn');
const solveBtn=document.getElementById('solveBtn');
const statusMsg=document.getElementById('statusMsg');
const themeToggle=document.getElementById('themeToggle');
const infoBtn=document.getElementById('infoBtn');
const rulesBtn=document.getElementById('rulesBtn');
const linkBubble=document.getElementById('linkBubble');
const rulesBubble=document.getElementById('rulesBubble');
const shareLinkInput=document.getElementById('shareLinkInput');
const copyLinkBtn=document.getElementById('copyLinkBtn');

const boardUI=new TangoBoardUI(boardEl);

// i18n
const isDE = navigator.language && navigator.language.toLowerCase().startsWith('de');
const I18N={
	de:{'btn.new':'Neu','btn.daily':'Tägliches Puzzle','btn.reset':'Zurücksetzen','btn.check':'Prüfen','btn.clean':'Fehler entfernen','btn.solve':'Lösen','btn.copy':'Kopieren','btn.constraints':'x/=', 'legend.eq':'gleiche Symbole','legend.neq':'unterschiedliche Symbole','rules.title':'Spielregeln','rules.r1':'Keine drei gleichen Symbole direkt hintereinander (waagerecht oder senkrecht).','rules.r2':'Jede Zeile und Spalte enthält gleich viele Sonnen und Monde.','rules.r3':'= verbindet Felder mit gleichen Symbolen.','rules.r4':'× verbindet Felder mit unterschiedlichen Symbolen.','rules.r4b':'Linienmodus: Blau = gleiche, Orange = unterschiedliche Symbole.','rules.r5':'Es gibt genau eine eindeutige Lösung.','status.ready':'Bereit.','status.gen':'Generiere...','status.good':'Viel Erfolg!','status.reset':'Zurückgesetzt','status.err.none':'Keine Fehler','status.err.some':'Fehler','status.solved':'Gelöst!','status.showSolution':'Lösung angezeigt','status.removed':'Fehler entfernt','status.link.copied':'Link kopiert','info.link':'Puzzle-Link:','label.size':'Größe:','label.difficulty':'Schwierigkeit:','tooltip.clean':'Falsche Eingaben löschen','tooltip.solve':'Lösung anzeigen (Demo)','tooltip.theme':'Theme wechseln','tooltip.rules':'Regeln anzeigen','tooltip.info':'Puzzle-Link kopieren','loading':'Wird geladen...'},
    en:{'btn.new':'New','btn.daily':'Daily Puzzle','btn.reset':'Reset','btn.check':'Check','btn.clean':'Clear Errors','btn.solve':'Solve','btn.copy':'Copy','btn.constraints':'x/=', 'legend.eq':'same symbols','legend.neq':'different symbols','rules.title':'Rules','rules.r1':'No three identical symbols consecutively (row or column).','rules.r2':'Each row and column has an equal number of suns and moons.','rules.r3':'= links cells that must be the same.','rules.r4':'× links cells that must be different.','rules.r4b':'Line mode: Blue = same, Orange = different.','rules.r5':'Exactly one unique solution exists.','status.ready':'Ready.','status.gen':'Generating...','status.good':'Good luck!','status.reset':'Reset','status.err.none':'No errors','status.err.some':'errors','status.solved':'Solved!','status.showSolution':'Solution shown','status.removed':'errors cleared','status.link.copied':'Link copied','info.link':'Puzzle link:','label.size':'Size:','label.difficulty':'Difficulty:','tooltip.clean':'Clear wrong entries','tooltip.solve':'Show solution (demo)','tooltip.theme':'Toggle theme','tooltip.rules':'Show rules','tooltip.info':'Copy puzzle link','loading':'Loading...'}
};
const t=k=>(isDE?I18N.de:I18N.en)[k]||k;
function applyI18n(){
	document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n');if(k)el.textContent=t(k);});
	// Button titles / tooltips
	cleanErrorsBtn.title=t('tooltip.clean');
	solveBtn.title=t('tooltip.solve');
	if(themeToggle)themeToggle.title=t('tooltip.theme');
	if(rulesBtn)rulesBtn.title=t('tooltip.rules');
	if(infoBtn)infoBtn.title=t('tooltip.info');
	if(copyLinkBtn)copyLinkBtn.textContent=t('btn.copy');
	const loadingEl=document.querySelector('.loading-placeholder');
	if(loadingEl)loadingEl.textContent=t('loading');
}
function updateLegend(symbolMode){const legend=document.getElementById('legendBar');if(!legend)return;legend.innerHTML='';if(symbolMode){legend.innerHTML=`<span>= ${t('legend.eq')}</span><span>× ${t('legend.neq')}</span>`;} else {legend.innerHTML=`<span><span class="eq-line"></span> ${t('legend.eq')}</span><span><span class="neq-line"></span> ${t('legend.neq')}</span>`;}}
if(constraintStyleBtn){constraintStyleBtn.addEventListener('click',()=>{boardUI.toggleConstraintMode();constraintStyleBtn.classList.toggle('active');updateLegend(boardUI.state.showConstraintSymbols);});}

// Seed / Links
const dateSeed=()=>new Date().toISOString().slice(0,10);
const uuidSeed=()=> (crypto.randomUUID? crypto.randomUUID(): Math.random().toString(36).slice(2)+Date.now().toString(36));
function parseParams(){
	const p=new URLSearchParams(location.search);
	const seed=p.get('seed');
	const size=p.get('size');
	const diff=p.get('diff');
	if(seed && size && diff) return {seed,size,diff};
	return {};
}
function buildLink(seed,size,diff){return location.href.split('?')[0]+`?seed=${encodeURIComponent(seed)}&size=${size}&diff=${diff}`;}
const setStatus=msg=>{statusMsg.textContent=msg;};

// Theme
const THEME_KEY='tango.theme';
function applyTheme(mode){document.documentElement.classList.remove('theme-light','theme-dark');document.documentElement.classList.add(mode==='dark'?'theme-dark':'theme-light');}
function systemPref(){return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
function initTheme(){const saved=localStorage.getItem(THEME_KEY);applyTheme(saved||systemPref());}
themeToggle.addEventListener('click',()=>{const dark=document.documentElement.classList.contains('theme-dark');const next=dark?'light':'dark';applyTheme(next);localStorage.setItem(THEME_KEY,next);});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',e=>{const saved=localStorage.getItem(THEME_KEY);if(!saved)applyTheme(e.matches?'dark':'light');});

// Game
let currentSeed=null;
function newGame(){const size=+sizeSelect.value;const diff=difficultySelect.value;setStatus(t('status.gen'));setTimeout(()=>{const seed=uuidSeed();const puzzle=generate(size,diff,seed);boardUI.setup(puzzle);currentSeed=seed;setStatus(t('status.good'));if(shareLinkInput)shareLinkInput.value=buildLink(currentSeed,size,diff);},30);}
function loadSeedGame(seed,size,diff){
	const sInt=parseInt(size,10);const d=diff; if(isNaN(sInt)|| sInt%2!==0){return newGame();}
	if(sizeSelect.querySelector(`option[value="${sInt}"]`)) sizeSelect.value=String(sInt);
	if(difficultySelect.querySelector(`option[value="${d}"]`)) difficultySelect.value=d;
	setStatus(t('status.gen'));
	setTimeout(()=>{const puzzle=generate(sInt,d,seed);boardUI.setup(puzzle);currentSeed=seed;setStatus(t('status.good'));if(shareLinkInput)shareLinkInput.value=buildLink(currentSeed,sInt,d);},30);
}
function dailyGame(){const size=+sizeSelect.value;const diff=difficultySelect.value;setStatus(t('status.gen'));setTimeout(()=>{const seed=`daily-${dateSeed()}-${size}-${diff}`;const puzzle=generate(size,diff,seed);boardUI.setup(puzzle);currentSeed=seed;setStatus(t('status.good'));if(shareLinkInput)shareLinkInput.value=buildLink(currentSeed,size,diff);},30);}
function checkSolved(){if(boardUI.isComplete()){const errs=boardUI.checkErrors();if(errs===0)setStatus(t('status.solved'));}}

// Events
newBtn.addEventListener('click',()=>{newGame(); if(location.search)history.replaceState({},'',location.pathname+location.hash); hideBubble();});
dailyBtn.addEventListener('click',()=>{dailyGame(); if(location.search)history.replaceState({},'',location.pathname+location.hash); hideBubble();});
resetBtn.addEventListener('click',()=>{boardUI.reset();setStatus(t('status.reset'));});
checkBtn.addEventListener('click',()=>{const e=boardUI.checkErrors();setStatus(e? e+' '+t('status.err.some'):t('status.err.none'));});
cleanErrorsBtn.addEventListener('click',()=>{const removed=boardUI.removeErrors();setStatus(removed? removed+' '+t('status.removed'):t('status.err.none'));});
solveBtn.addEventListener('click',()=>{const solved={grid:boardUI.state.solution.map(r=>r.map(c=>({...c,fixed:true}))),solution:boardUI.state.solution,constraints:boardUI.state.constraints,size:boardUI.state.size,difficulty:'debug'};boardUI.setup(solved);setStatus(t('status.showSolution'));});

function hideBubble(){if(linkBubble && !linkBubble.classList.contains('hidden'))linkBubble.classList.add('hidden');}
function hideRules(){if(rulesBubble && !rulesBubble.classList.contains('hidden'))rulesBubble.classList.add('hidden');}
function toggleRules(){if(!rulesBubble)return; if(rulesBubble.classList.contains('hidden')){renderRules();rulesBubble.classList.remove('hidden');} else {hideRules();}}
function renderRules(){if(!rulesBubble)return;rulesBubble.innerHTML=`<h3>${t('rules.title')}</h3><ul><li>${t('rules.r1')}</li><li>${t('rules.r2')}</li><li>${t('rules.r3')}</li><li>${t('rules.r4')}</li><li>${t('rules.r4b')}</li><li>${t('rules.r5')}</li></ul>`;}
infoBtn.addEventListener('click',e=>{e.stopPropagation();if(!currentSeed)return; if(!linkBubble)return; if(linkBubble.classList.contains('hidden')){shareLinkInput.value=buildLink(currentSeed,sizeSelect.value,difficultySelect.value);linkBubble.classList.remove('hidden');shareLinkInput.select();hideRules();} else {hideBubble();}});
if(rulesBtn){rulesBtn.addEventListener('click',e=>{e.stopPropagation();toggleRules();hideBubble();});}
if(copyLinkBtn)copyLinkBtn.addEventListener('click',()=>{if(!shareLinkInput.value)return;navigator.clipboard.writeText(shareLinkInput.value).then(()=>setStatus(t('status.link.copied')));});
document.addEventListener('click',e=>{if(linkBubble && !linkBubble.contains(e.target) && e.target!==infoBtn)hideBubble();if(rulesBubble && !rulesBubble.contains(e.target) && e.target!==rulesBtn)hideRules();});

// Auto-Neustart bei Änderung von Größe oder Schwierigkeit
sizeSelect.addEventListener('change',()=>{newGame();updateLegend(boardUI.state.showConstraintSymbols);hideBubble();hideRules();if(location.search)history.replaceState({},'',location.pathname+location.hash);});
difficultySelect.addEventListener('change',()=>{newGame();updateLegend(boardUI.state.showConstraintSymbols);hideBubble();hideRules();if(location.search)history.replaceState({},'',location.pathname+location.hash);});

document.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();}});

// Init
initTheme();
applyI18n();
const initParams=parseParams();
if(initParams.seed){
	loadSeedGame(initParams.seed, initParams.size, initParams.diff);
} else {
	if(location.search){history.replaceState({},'',location.pathname+location.hash);} 
	newGame();
	updateLegend(false);
}
renderRules();

setInterval(()=>{if(boardUI.isComplete())checkSolved();},900);
