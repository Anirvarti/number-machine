const $=id=>document.getElementById(id);
const OPS={
"+":{label:"+",name:"Add",cls:"plus",apply:(x,n)=>x+n},
"-":{label:"−",name:"Subtract",cls:"minus",apply:(x,n)=>x-n},
"*":{label:"×",name:"Multiply",cls:"multiply",apply:(x,n)=>x*n},
"/":{label:"÷",name:"Divide",cls:"divide",apply:(x,n)=>x/n}
};
let chain=[],audioCtx=null,stopToken=0;
function fmt(n){if(!Number.isFinite(n))return"—";return Math.abs(n-Math.round(n))<1e-9?String(Math.round(n)):String(Number(n.toFixed(4)))}
function playTone(freq=440,duration=.12,type="sine",volume=.035){try{audioCtx||=(new(window.AudioContext||window.webkitAudioContext)());const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(volume,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+duration);o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration)}catch(e){}}
function opSound(op){if(op==="+"){playTone(523);setTimeout(()=>playTone(659),65)}if(op==="-"){playTone(440);setTimeout(()=>playTone(330),65)}if(op==="*"){playTone(440,.08);setTimeout(()=>playTone(554,.08),55);setTimeout(()=>playTone(659,.13),110)}if(op==="/"){playTone(659,.08);setTimeout(()=>playTone(440,.13),70)}}
function renderChain(){const box=$("chain");box.innerHTML="";let value=Number($("startNumber").value)||2;let n=document.createElement("div");n.className="number-node";n.textContent=fmt(value);box.appendChild(n);chain.forEach(m=>{let a=document.createElement("span");a.className="arrow";a.textContent="→";box.appendChild(a);let node=document.createElement("div");node.className=`machine-node ${OPS[m.op].cls}`;node.innerHTML=`${OPS[m.op].label}${m.amount}<small>${OPS[m.op].name}</small>`;box.appendChild(node);let a2=document.createElement("span");a2.className="arrow";a2.textContent="→";box.appendChild(a2);value=OPS[m.op].apply(value,m.amount);let num=document.createElement("div");num.className="number-node";num.textContent=fmt(value);box.appendChild(num)});$("finalResult").textContent=fmt(value);$("machineExplanation").innerHTML=chain.length?`<b>Machine chain:</b> ${fmt(Number($("startNumber").value)||2)} ${chain.map(m=>`${OPS[m.op].label}${m.amount}`).join(" → ")} = <b>${fmt(value)}</b>. Every step uses one of the four basic operations.`:`<b>How it works:</b> each machine takes one number, applies one operation, and passes the result to the next machine.`}
document.querySelectorAll(".op").forEach(b=>b.onclick=()=>{let op=b.dataset.op,amount=Math.max(1,Math.min(99,Number($("amount").value)||1));chain.push({op,amount});renderChain();opSound(op)});
$("startNumber").oninput=renderChain;$("clearChain").onclick=()=>{chain=[];renderChain()};renderChain();

const puzzles=[
{pairs:[[3,7],[5,11],[10,21]],answer:"×2 → +1"},
{pairs:[[2,7],[4,11],[8,19]],answer:"×2 → +3"},
{pairs:[[4,9],[7,15],[10,21]],answer:"×2 → −1"},
{pairs:[[2,8],[5,20],[7,28]],answer:"×4"},
{pairs:[[10,7],[15,12],[20,17]],answer:"−3"},
{pairs:[[3,12],[5,20],[8,32]],answer:"×4"}];
let pi=0;
function ruleLabel(r){return r.map(([o,n])=>`${OPS[o].label}${n}`).join(" → ")}
function applyRule(x,r){for(const[o,n]of r)x=OPS[o].apply(x,n);return x}
function genRules(){let out=[],ops=["+","-","*","/"],nums=[1,2,3,4,5];for(const o of ops)for(const n of nums)out.push([[o,n]]);for(const a of ops)for(const n of nums)for(const b of ops)for(const m of nums)out.push([[a,n],[b,m]]);return out}
const RULES=genRules();
function search(p,cb){let hits=[];RULES.forEach((r,i)=>{if(p.pairs.every(([x,y])=>{let z=applyRule(x,r);return Number.isFinite(z)&&Math.abs(z-y)<1e-9}))hits.push(r);if(cb&&(i%25===0||i===RULES.length-1))cb(i+1,RULES.length)});return hits}
function renderPuzzle(){let p=puzzles[pi];$("examples").innerHTML=p.pairs.map(([x,y])=>`<div class="example"><b>${x}</b><span>→</span><b>${y}</b></div>`).join("");let labels=[p.answer,"×2 → +1","×2 → +3","×2 → −1","+2","−3","×4","÷2"];labels=[...new Set(labels)];$("choices").innerHTML=labels.map(x=>`<button class="choice" data-label="${x}">${x}</button>`).join("");$("guessResult").hidden=true;$("searchProgress").style.width="0%";$("reasoning").textContent="";$("searchStatus").textContent="Ready to test possible machines.";document.querySelectorAll(".choice").forEach(b=>b.onclick=()=>{let good=b.dataset.label===p.answer;let box=$("guessResult");box.hidden=false;box.className="result-box"+(good?"":" bad");box.innerHTML=good?`🎉 <b>Correct!</b> Now let the AI search for the machine.`:`Not this one. Check whether it fits every example.`;runSearch()})}
function runSearch(){let p=puzzles[pi],hits=search(p,(d,t)=>$("searchProgress").style.width=`${d/t*100}%`),labs=hits.map(ruleLabel);$("searchStatus").textContent=`Tested ${RULES.length} candidate machines.`;$("reasoning").textContent=`AI tested one- and two-step combinations.

Matches:
${labs.slice(0,10).map(x=>"✓ "+x).join("\n")||"none"}

`+(labs.length>1?"More than one rule fits. The AI reports uncertainty.":labs.length===1?"One tested rule fits every example.":"No tested rule fits every example.")}
$("newPuzzle").onclick=()=>{pi=(pi+1)%puzzles.length;renderPuzzle()};renderPuzzle();

function parseSeq(){return $("sequence").value.split(",").map(Number).filter(Number.isFinite).slice(0,20)}
function renderSeq(){let ns=parseSeq();$("sequenceDisplay").innerHTML=ns.map(n=>`<span class="seq-chip">${fmt(n)}</span>`).join("");let b=$("bars");b.innerHTML="";if(!ns.length)return;let mi=Math.min(...ns),ma=Math.max(...ns),ra=Math.max(ma-mi,1);ns.forEach(n=>{let i=document.createElement("i");i.style.height=`${25+(n-mi)/ra*115}px`;b.appendChild(i)})}
$("sequence").oninput=renderSeq;document.querySelectorAll(".presets button").forEach(b=>b.onclick=()=>{$("sequence").value=b.dataset.seq;renderSeq()});
$("playSequence").onclick=async()=>{let ns=parseSeq();if(!ns.length)return;stopToken++;let token=stopToken;try{audioCtx||=(new(window.AudioContext||window.webkitAudioContext)());await audioCtx.resume()}catch(e){}let mi=Math.min(...ns),ma=Math.max(...ns),ra=Math.max(ma-mi,1),bars=[...$("bars").children];for(let i=0;i<ns.length;i++){if(token!==stopToken)break;playTone(220+(ns[i]-mi)/ra*660,.22);bars.forEach((x,j)=>x.style.opacity=j===i?"1":".35");await new Promise(r=>setTimeout(r,300))}}
$("stopSequence").onclick=()=>{stopToken++;[...$("bars").children].forEach(x=>x.style.opacity="1")};renderSeq();
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.tab).classList.add("active")});
