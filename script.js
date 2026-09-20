const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const info={
 hub:['ハブの役割','同じLANの中で複数の有線機器を接続します。教室のPCなどをまとめてつなぐイメージです。'],
 ap:['アクセスポイントの役割','スマートフォンやタブレットを無線（Wi-Fi）でLANに接続する入口です。'],
 router:['ルータの役割','LANとWANなど異なるネットワークを接続し、データをどこへ送るか判断します。'],
 internet:['WAN・インターネット','離れた場所にある多数のネットワーク同士を結びます。'],
 server:['Webサーバの役割','ブラウザなどからの要求を受け、Webページなどのデータを返します。']
};
$$('[data-info]').forEach(el=>el.addEventListener('click',()=>{$('#explain').innerHTML=`<h3>${info[el.dataset.info][0]}</h3><p>${info[el.dataset.info][1]}</p>`}));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let running=false;
function center(el){const n=$('.network').getBoundingClientRect(),r=el.getBoundingClientRect();return{x:r.left-n.left+r.width/2,y:r.top-n.top+r.height/2}}
async function movePacket(el){const p=$('#packet'),pos=center(el);p.style.display='block';p.style.transition='left .55s ease, top .55s ease';p.style.left=(pos.x-20)+'px';p.style.top=(pos.y-15)+'px';el.classList.add('active');await sleep(650);el.classList.remove('active')}
function reset(){running=false;$('#packet').style.display='none';$$('.device').forEach(x=>x.classList.remove('active','failed'));$$('.line,.wan-line').forEach(x=>x.classList.remove('off'));$('#result').className='result idle';$('#result').textContent='待機中：通信をスタートしてください。';$('#log').innerHTML='<li>通信経路がここに表示されます。</li>'}
function failVisual(s,source){if(s==='cable'&&source==='pc'){$('[data-path="pc"]').classList.add('off');$('#pc').classList.add('failed')}if(s==='ap'){$('#ap').classList.add('failed');$('[data-path="wireless"]').classList.add('off')}if(s==='router'){$('#router').classList.add('failed');$('[data-path="common"]').classList.add('off')}if(s==='wan'){$$('[data-path^="wan"]').forEach(x=>x.classList.add('off'));$('#internet').classList.add('failed')}}
async function run(){if(running)return;reset();running=true;const source=$('#source').value,scenario=$('#scenario').value;failVisual(scenario,source);const wireless=source!=='pc';let path=wireless?[source,'ap','hub','router','internet','server']:[source,'hub','router','internet','server'];let failAt=null,msg='';
 if(scenario==='cable'&&source==='pc'){failAt=0;msg='LANケーブルが抜けているため、PCはハブへデータを送れません。'}
 if(scenario==='ap'&&wireless){failAt=1;msg='アクセスポイントが停止しているため、無線端末はLANに参加できません。'}
 if(scenario==='router'){failAt=3-(wireless?0:1);msg='ルータが停止しているため、LAN内からWANへ出られません。'}
 if(scenario==='wan'){failAt=4-(wireless?0:1);msg='WAN側で障害が起きているため、インターネット上のWebサーバまで届きません。'}
 // Cable fault does not affect wireless devices: useful comparison.
 $('#log').innerHTML='';
 for(let i=0;i<path.length;i++){
   const id=path[i],el=$('#'+id); await movePacket(el);
   const li=document.createElement('li');li.textContent=({pc:'有線PCからデータを送信',phone:'スマートフォンからWi-Fiで送信',tablet:'タブレットからWi-Fiで送信',ap:'アクセスポイントが無線通信をLANへ橋渡し',hub:'ハブを通ってLAN内を移動',router:'ルータがWAN側へ転送',internet:'WAN（インターネット）を通過',server:'Webサーバに到着！応答データが返される'})[id];$('#log').appendChild(li);
   if(failAt===i){el.classList.add('failed');$('#result').className='result failure';$('#result').textContent='✕ 通信失敗：'+msg;$('#packet').style.display='none';running=false;return}
 }
 $('#result').className='result success';$('#result').textContent='✓ 通信成功：LAN → ルータ → WAN → Webサーバまでデータが届きました。';running=false
}
$('#start').addEventListener('click',run);$('#reset').addEventListener('click',reset);
$('#scenario').addEventListener('change',reset);$('#source').addEventListener('change',reset);
$$('[data-answer]').forEach(b=>b.addEventListener('click',()=>{$('#quizResult').textContent=b.dataset.answer==='correct'?'✓ 正解！ アクセスポイントは無線端末をLANにつなぎます。':'もう一度考えよう。ヒント：Wi-Fiの電波を使う機器です。'}));
