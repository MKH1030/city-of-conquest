(() => {
"use strict";
const SAVE_KEY = "kingdomConquestCrownRealm_v1";
const $ = id => document.getElementById(id);
const freshState = () => ({
 gold:100,wood:100,food:100,stone:40,gems:0,day:1,level:1,population:20,
 infantry:10,archers:0,cavalry:0,farms:0,lumber:0,mines:0,territory:1,owned:[0],
 research:{farming:false,tactics:false,trade:false,scouting:false},
 stats:{gathers:0,buildings:0,battles:0,wins:0,trained:0,days:0}, claimed:[], achievements:[], morale:100, gameOver:false
});
let s = freshState();
let regions = [
 {name:"Greenfields",icon:"🌳",power:12,reward:70,desc:"Quiet farmland"},
 {name:"Bandit Woods",icon:"🏕️",power:20,reward:100,desc:"Bandits guard old supplies"},
 {name:"Iron Hills",icon:"⛰️",power:30,reward:140,desc:"Rich in stone and ore"},
 {name:"Coastlands",icon:"🌊",power:35,reward:160,desc:"A valuable trading coast"},
 {name:"Red Valley",icon:"🌋",power:42,reward:180,desc:"A fierce rival outpost"},
 {name:"Old Ruins",icon:"🏛️",power:48,reward:210,desc:"Ancient treasures lie here"},
 {name:"Frost March",icon:"❄️",power:55,reward:230,desc:"A harsh northern frontier"},
 {name:"Dragon Keep",icon:"🐉",power:75,reward:350,desc:"A legendary fortress"},
 {name:"Royal Capital",icon:"👑",power:95,reward:500,desc:"A powerful rival kingdom",capital:true}
];
const startingRegions = regions.map(r=>({...r}));
const quests = [
 {id:"first_gather",title:"A Helping Hand",desc:"Gather resources once.",goal:()=>s.stats.gathers>=1,reward:{gold:50,food:20}},
 {id:"first_build",title:"Foundations",desc:"Build your first farm, lumber camp, or mine.",goal:()=>s.stats.buildings>=1,reward:{gold:60,wood:25}},
 {id:"recruit",title:"Call to Arms",desc:"Train troops 3 times.",goal:()=>s.stats.trained>=3,reward:{gold:75,food:30}},
 {id:"first_win",title:"First Victory",desc:"Win your first battle.",goal:()=>s.stats.wins>=1,reward:{gold:100,gems:1}},
 {id:"two_regions",title:"Growing Realm",desc:"Control at least 3 territories.",goal:()=>s.territory>=3,reward:{gold:150,stone:30}},
 {id:"castle2",title:"Stone and Glory",desc:"Upgrade your castle to level 2.",goal:()=>s.level>=2,reward:{wood:60,food:60}},
 {id:"research",title:"A Brighter Future",desc:"Research any technology.",goal:()=>Object.values(s.research).some(Boolean),reward:{gold:100,gems:1}},
 {id:"rich",title:"Royal Treasury",desc:"Hold 500 gold at once.",goal:()=>s.gold>=500,reward:{gems:2,stone:50}},
 {id:"farmer",title:"Breadbasket",desc:"Build 3 farms.",goal:()=>s.farms>=3,reward:{food:180,gold:80}},
 {id:"conquer5",title:"The Expanding Crown",desc:"Control 5 territories.",goal:()=>s.territory>=5,reward:{gold:250,gems:3}},
 {id:"level3",title:"Mighty Fortress",desc:"Reach castle level 3.",goal:()=>s.level>=3,reward:{stone:100,gems:2}},
 {id:"veteran",title:"Veteran Commander",desc:"Win 5 battles.",goal:()=>s.stats.wins>=5,reward:{gold:300,gems:3}}
];
const achievements=[
 {id:"gather10",name:"Resourceful",desc:"Gather resources 10 times",goal:()=>s.stats.gathers>=10,reward:{gems:1}},
 {id:"warrior",name:"Warrior King",desc:"Win 3 battles",goal:()=>s.stats.wins>=3,reward:{gems:2}},
 {id:"builder",name:"Master Builder",desc:"Build 5 structures",goal:()=>s.stats.buildings>=5,reward:{gems:1}},
 {id:"explorer",name:"World Explorer",desc:"Own 6 territories",goal:()=>s.territory>=6,reward:{gems:3}}
];
function log(message){const p=document.createElement("p");p.textContent=`Day ${s.day}: ${message}`;$("log").prepend(p);while($("log").children.length>45)$("log").lastChild.remove()}
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function power(){return Math.floor((s.infantry+s.archers*1.5+s.cavalry*2.4)*(s.research.tactics?1.2:1)*(s.morale/100))}
function save(silent=false){try{s.worldRegions=regions;localStorage.setItem(SAVE_KEY,JSON.stringify(s));if(!silent)log("Game saved on this device.")}catch(e){if(!silent)log("Could not save. Check your browser storage settings.")}}
function pay(cost){for(const [k,v] of Object.entries(cost)){if(s[k]<v){log(`Not enough ${k}. Required: ${v}; you have ${s[k]}.`);return false}}for(const [k,v] of Object.entries(cost))s[k]-=v;return true}
function rewardText(r){return Object.entries(r).map(([k,v])=>`+${v} ${k}`).join(", ")}
function act(fn){if(s.gameOver){log("Your campaign has ended. Start a new game to play again.");return}fn();checkMilestones();render();save(true)}
function build(key,cost,label){act(()=>{if(pay(cost)){s[key]++;s.stats.buildings++;log(`${label} built! It will help your realm each day.`)}})}
function battle(i){if(s.gameOver||s.owned.includes(i))return;const r=regions[i];if(power()<r.power){log(`${r.name} is too strong. You need army power ${r.power}; yours is ${power()}.`);return}
act(()=>{s.stats.battles++;const my=power()*(.75+Math.random()*.5),foe=r.power*(.8+Math.random()*.45);if(my>foe){s.owned.push(i);s.territory=s.owned.length;s.gold+=r.reward;s.stats.wins++;s.food+=25;s.morale=Math.min(100,s.morale+5);const loss=Math.min(s.infantry,rand(0,Math.max(1,Math.floor(s.infantry/4))));s.infantry-=loss;log(`VICTORY at ${r.name}! Captured ${r.reward} gold and 25 food. Lost ${loss} infantry.`);if(r.capital){s.gems+=5;log("The rival Royal Capital falls! Bonus: 5 gems.")}}else{const loss=Math.min(s.infantry,rand(1,Math.max(1,Math.floor(s.infantry/3))));s.infantry-=loss;s.morale=Math.max(50,s.morale-10);log(`Defeat at ${r.name}. Lost ${loss} infantry and 10 morale.`)}})}
function generateFrontier(count=5){
 const biomes=[{label:"Emerald Reach",icon:"🌿",desc:"Fertile valleys and old roads"},{label:"Whispering Wilds",icon:"🌲",desc:"Dense forests hide rival scouts"},{label:"Sunscar Dunes",icon:"🏜️",desc:"Caravans cross the golden sands"},{label:"Stormbreak Coast",icon:"🌊",desc:"Ports full of trade and danger"},{label:"Frostfang Range",icon:"❄️",desc:"Mountain strongholds guard rare ore"},{label:"Ashen Expanse",icon:"🌋",desc:"Volcanic lands and hardened foes"},{label:"Moonlit Marches",icon:"🌙",desc:"Ancient ruins beneath silver skies"}];
 const start=regions.length;
 for(let n=0;n<count;n++){const idx=start+n,step=Math.floor(idx/5),b=biomes[idx%biomes.length],serial=idx+1;regions.push({name:`${b.label} ${serial}`,icon:b.icon,power:Math.floor(22+idx*8+step*3),reward:Math.floor(90+idx*24),desc:b.desc,capital:false})}
 s.frontierExpansions=(s.frontierExpansions||0)+1;log(`The frontier expands! ${count} new regions have been charted.`);
}
function checkMilestones(){if(s.territory>=5&&!s.achievements.includes("territory5")){s.achievements.push("territory5");log("Milestone reached: five territories under your banner!")};if(power()<=0&&!s.gameOver){s.gameOver=true;log("GAME OVER: Your army has fallen and your capital has been overrun. Start a new campaign to try again.")}}
function render(){for(const k of ["gold","wood","food","stone","gems","day","level","population","territory"])$(k).textContent=s[k];$("armyPower").textContent=power();$("rank").textContent=s.level>=4?"High King":s.territory>=4?"Conqueror":s.level>=2?"Lord":"New Ruler";$("castleArt").textContent=s.level>=5?"🏯":s.level>=3?"🏰":"🏰";$("castleProgress").style.width=Math.min(100,s.level*20)+"%";$("statusText").textContent=s.gameOver?"GAME OVER — your capital has fallen. Start a new campaign to rise again.":`${s.territory} territories controlled across an expanding world. No final region exists.`;$("upgradeCost").textContent=`${s.level*100} gold · ${s.level*80} wood · ${s.level*20} stone`;
$("buildings").innerHTML=[["🌾 Farms",s.farms],["🪓 Lumber camps",s.lumber],["⛏️ Mines",s.mines]].map(([n,v])=>`<div class="building">${n}: <b>${v}</b></div>`).join("");
$("armyDetails").innerHTML=[["🛡️ Infantry",s.infantry],["🏹 Archers",s.archers],["🐎 Cavalry",s.cavalry],["💪 Morale",s.morale+"%"],["⚔️ Army power",power()],["🏅 Battles won",s.stats.wins]].map(([n,v])=>`<div class="detail">${n}<b>${v}</b></div>`).join("");
renderWorld();renderQuests();renderResearch()}
function renderWorld(){$("worldMap").innerHTML="";regions.forEach((r,i)=>{const b=document.createElement("button");b.className="region "+(s.owned.includes(i)?"owned":"");b.innerHTML=`<span class="emoji">${r.icon}</span><strong>${r.name}</strong><small>${s.owned.includes(i)?"✅ Your territory":`Enemy power: ${r.power}`}</small><small>${r.desc}</small>`;b.disabled=s.owned.includes(i)||s.gameOver;b.onclick=()=>battle(i);$("worldMap").append(b)});const explore=document.createElement("button");explore.className="action green";explore.style.gridColumn="1 / -1";explore.innerHTML="🧭<b>Explore beyond the frontier</b><small>Chart five new regions. The world keeps expanding.</small>";explore.disabled=s.gameOver;explore.onclick=()=>act(()=>generateFrontier(5));$("worldMap").append(explore);const note=document.createElement("p");note.className="small";note.style.gridColumn="1 / -1";note.textContent=`Known regions: ${regions.length} · Frontier expansions: ${s.frontierExpansions||0} · Keep exploring for more lands.`;$("worldMap").append(note)}
function renderQuests(){let completed=0;$("questList").innerHTML=quests.map(q=>{const done=q.goal(),claimed=s.claimed.includes(q.id);if(done)completed++;return `<div class="quest ${done?"done":""} ${claimed?"claimed":""}"><b>${claimed?"✅":done?"🎁":"⬜"} ${q.title}</b><p>${q.desc}</p><p>Reward: ${rewardText(q.reward)}</p>${done&&!claimed?`<button class="button" data-claim="${q.id}">Claim reward</button>`:""}</div>`}).join("");$("questCount").textContent=`${completed}/${quests.length} complete`;document.querySelectorAll("[data-claim]").forEach(b=>b.onclick=()=>act(()=>{const q=quests.find(x=>x.id===b.dataset.claim);if(!q||s.claimed.includes(q.id)||!q.goal())return;s.claimed.push(q.id);for(const[k,v]of Object.entries(q.reward))s[k]+=v;log(`Quest completed: ${q.title}! ${rewardText(q.reward)}.`)}));
$("achievementList").innerHTML=achievements.map(a=>{const done=s.achievements.includes(a.id)||a.goal();if(done&&!s.achievements.includes(a.id)){s.achievements.push(a.id);for(const[k,v]of Object.entries(a.reward))s[k]+=v;log(`Achievement unlocked: ${a.name}! ${rewardText(a.reward)}.`)}return `<div class="quest ${done?"done":""}"><b>${done?"🏅":"🔒"} ${a.name}</b><p>${a.desc}</p><p>Reward: ${rewardText(a.reward)} ${done?"· Unlocked":""}</p></div>`}).join("")}
function renderResearch(){const techs=[{id:"farming",name:"🌱 Improved Farming",desc:"Farms produce 35 food per day instead of 20.",cost:{gold:80,wood:30}},{id:"tactics",name:"⚔️ Military Tactics",desc:"Increase army power by 20%.",cost:{gold:100,stone:40}},{id:"trade",name:"🪙 Trade Routes",desc:"Market trades earn 25% more gold.",cost:{gold:90,wood:20}},{id:"scouting",name:"🦅 Scout Network",desc:"Scouting reveals enemy strength and gives 1 gem.",cost:{gold:70,food:30}}];$("researchList").innerHTML=techs.map(t=>`<div class="research-card"><b>${t.name} ${s.research[t.id]?"✅":""}</b><p>${t.desc}</p><p>Cost: ${Object.entries(t.cost).map(([k,v])=>`${v} ${k}`).join(" · ")}</p><button class="button" data-tech="${t.id}" ${s.research[t.id]?"disabled":""}>${s.research[t.id]?"Researched":"Research"}</button></div>`).join("");document.querySelectorAll("[data-tech]").forEach(b=>b.onclick=()=>act(()=>{const t=techs.find(x=>x.id===b.dataset.tech);if(s.research[t.id])return;if(pay(t.cost)){s.research[t.id]=true;if(t.id==="scouting")s.gems++;log(`${t.name} complete!`)}}))}
$("gatherBtn").onclick=()=>act(()=>{const r={gold:rand(25,55),wood:rand(20,45),food:rand(20,45),stone:rand(5,15)};for(const[k,v]of Object.entries(r))s[k]+=v;s.stats.gathers++;log("Workers gathered "+rewardText(r)+".")});
$("farmBtn").onclick=()=>build("farms",{wood:30},"Farm");$("lumberBtn").onclick=()=>build("lumber",{wood:35},"Lumber camp");$("mineBtn").onclick=()=>build("mines",{wood:40},"Mine");
$("upgradeBtn").onclick=()=>act(()=>{if(pay({gold:s.level*100,wood:s.level*80,stone:s.level*20})){s.level++;s.population+=10;log(`Castle upgraded to level ${s.level}. Population +10.`)}});
$("marketBtn").onclick=()=>act(()=>{const mult=s.research.trade?1.25:1;if(s.food>=20){s.food-=20;let v=Math.floor(50*mult);s.gold+=v;log(`Sold 20 food for ${v} gold.`)}else if(s.wood>=20){s.wood-=20;let v=Math.floor(40*mult);s.gold+=v;log(`Sold 20 wood for ${v} gold.`)}else log("Need at least 20 food or 20 wood to trade.")});
function recruit(type,n,cost){act(()=>{if(pay(cost)){s[type]+=n;s.stats.trained++;log(`Trained ${n} ${type}.`)}})}
$("infantryBtn").onclick=()=>recruit("infantry",5,{gold:25,food:15});$("archerBtn").onclick=()=>recruit("archers",5,{gold:35,wood:10});$("cavalryBtn").onclick=()=>recruit("cavalry",3,{gold:60,food:20});
$("healBtn").onclick=()=>act(()=>{if(pay({gold:25})){s.morale=Math.min(100,s.morale+25);log("The army rallies. Morale increased.")}});
$("endDayBtn").onclick=()=>act(()=>{s.day++;s.stats.days++;const upkeep=(s.infantry+s.archers+s.cavalry)*2;s.food-=upkeep;const farmFood=s.farms*(s.research.farming?35:20),wood=s.lumber*15,stone=s.mines*10,tax=s.territory*5;s.food+=farmFood;s.wood+=wood;s.stone+=stone;s.gold+=tax;log(`Daily report: army used ${upkeep} food; farms +${farmFood} food; lumber camps +${wood} wood; mines +${stone} stone; taxes +${tax} gold.`);if(s.food<0){s.food=0;const loss=Math.min(s.infantry,2);s.infantry-=loss;s.morale=Math.max(40,s.morale-10);log(`Famine! Lost ${loss} infantry. Build farms or gather food.`)}if(Math.random()<.2){let bonus=rand(10,30);s.gold+=bonus;log(`A traveling merchant paid ${bonus} gold in taxes.`)}if(s.day>=5&&Math.random()<Math.min(.08+(s.day-5)*.012,.28)){const invasion=Math.floor(18+s.day*5+s.territory*2+rand(0,18));log(`ENEMY INVASION! Rival forces of power ${invasion} approach your capital (your army power: ${power()}).`);if(power()>=invasion){s.gold+=35;s.morale=Math.min(100,s.morale+4);log("Your defenders repel the invasion! +35 gold and morale restored.")}else{s.gameOver=true;log("CAPITAL LOST. The enemy has broken your defenses. GAME OVER — start a new campaign to try again.")}}});
$("saveBtn").onclick=()=>save(false);$("loadBtn").onclick=()=>{try{const data=localStorage.getItem(SAVE_KEY);if(!data){log("No saved game found on this browser.");return}const parsed=JSON.parse(data);s=Object.assign(freshState(),parsed);if(Array.isArray(parsed.worldRegions)&&parsed.worldRegions.length)regions=parsed.worldRegions;log("Saved campaign loaded.");render()}catch(e){log("Could not load the save.")}};
$("newBtn").onclick=()=>{if(confirm("Start a new campaign? This replaces the current in-memory progress. Save first if you want to keep it.")){s=freshState();regions=startingRegions.map(r=>({...r}));$("log").innerHTML="";log("A new ruler takes the throne. Your endless frontier awaits.");render();save(true)}};
$("clearLogBtn").onclick=()=>$("log").innerHTML="";
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".tab-panel").forEach(p=>p.classList.toggle("hidden",p.id!==b.dataset.tab))});
try{const data=localStorage.getItem(SAVE_KEY);if(data){const parsed=JSON.parse(data);if(parsed&&parsed.gold!==undefined){s=Object.assign(freshState(),parsed);if(Array.isArray(parsed.worldRegions)&&parsed.worldRegions.length)regions=parsed.worldRegions;log("Autosaved campaign loaded from this browser.")}}}catch(e){log("Save data could not be read; starting a new campaign.")}render();
})();