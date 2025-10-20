const input = document.getElementById('search-input');
const historyList = document.getElementById('history-list');
const keyboardContainer = document.getElementById('virtual-keyboard');
const keyboardBtn = document.getElementById('open-keyboard');
const modeIaBtn = document.getElementById('mode-ia');

input.addEventListener('focus', showHistory);
input.addEventListener('input', hideHistory);
document.addEventListener('click', e => { if(!e.target.closest('.search-container')) hideHistory(); });

function saveToHistory(q){
  let h=JSON.parse(localStorage.getItem('searchHistory'))||[];
  if(!h.includes(q)){ h.unshift(q); localStorage.setItem('searchHistory', JSON.stringify(h)); }
}

function showHistory(){
  let h=JSON.parse(localStorage.getItem('searchHistory'))||[];
  if(!h.length) return;
  historyList.innerHTML='';
  h.forEach(i=>{
    let li=document.createElement('li');
    li.textContent=i;
    li.onclick=()=>{ input.value=i; searchGoogle(); };
    historyList.appendChild(li);
  });
  historyList.style.display='block';
}

function hideHistory(){ historyList.style.display='none'; }

function searchGoogle(){
  let q=input.value.trim();
  if(!q) return;
  saveToHistory(q);
  window.location.href=`https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

function luckySearch(){ window.location.href="https://doodles.google/"; }

document.querySelector('.mic-btn').addEventListener('click', ()=>{
  const r=new(window.SpeechRecognition||window.webkitSpeechRecognition)();
  r.lang='pt-BR';
  r.start();
  r.onresult=e=>input.value=e.results[0][0].transcript;
});

document.querySelector('.lens-btn').addEventListener('click', async ()=>{
  const choice = confirm("Clique em OK para usar a câmera ou Cancelar para enviar uma imagem do dispositivo.");

  if(choice){
    try{
      const stream = await navigator.mediaDevices.getUserMedia({video:true});
      const video = document.createElement('video');
      video.srcObject = stream;
      video.style.position = "fixed";
      video.style.top = "50%";
      video.style.left = "50%";
      video.style.transform = "translate(-50%, -50%)";
      video.style.zIndex = 3000;
      video.style.maxWidth = "90%";
      video.style.maxHeight = "70%";
      document.body.appendChild(video);
      video.play();

      const captureBtn = document.createElement('button');
      captureBtn.textContent = "Capturar Foto";
      captureBtn.style.position = "fixed";
      captureBtn.style.top = "10px";
      captureBtn.style.left = "10px";
      captureBtn.style.zIndex = 3001;
      document.body.appendChild(captureBtn);

      captureBtn.addEventListener('click', ()=>{
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video,0,0);
        // Reduzindo qualidade e bits por pixel
        const imageURL = canvas.toDataURL('image/jpeg', 0.5);
        window.open(`https://www.google.com/searchbyimage?image_url=${encodeURIComponent(imageURL)}`, '_blank');

        stream.getTracks().forEach(track => track.stop());
        video.remove();
        captureBtn.remove();
      });

    } catch {
      alert('Câmera não disponível.');
    }
  } else {
    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = 'image/*';
    inputFile.click();
    inputFile.onchange = () => {
      const file = inputFile.files[0];
      if(!file) return;
      const imageURL = URL.createObjectURL(file);
      window.open(`https://www.google.com/searchbyimage?image_url=${encodeURIComponent(imageURL)}`, '_blank');
    };
  }
});

modeIaBtn.addEventListener('click', ()=>{
  window.location.href="https://gemini.google.com/app?hl=pt-BR";
});

function animateLogo(){
  const letters = document.querySelectorAll('.logo span');
  letters.forEach((letter, index)=>{
    setTimeout(()=>{
      letter.classList.add('animate');
      setTimeout(()=>letter.classList.remove('animate'), 600);
    }, index * 100);
  });
}

animateLogo();
setInterval(animateLogo, 5 * 60 * 1000); // a cada 5 minutos

const rows=[
  ['`','1','2','3','4','5','6','7','8','9','0','-','=','←'],
  ['q','w','e','r','t','y','u','i','o','p','[',']','\\'],
  ['a','s','d','f','g','h','j','k','l','ç',';','\'','Enter'],
  ['z','x','c','v','b','n','m',',','.','/','Espaço']
];

function createKeyboard(){
  keyboardContainer.innerHTML='';
  rows.forEach(r=>{
    r.forEach(k=>{
      const b=document.createElement('button');
      b.textContent=k;
      b.classList.add('key');
      if(k==='Espaço') b.style.gridColumn='span 5';
      if(k==='Enter') b.style.gridColumn='span 2';
      keyboardContainer.appendChild(b);
    });
  });
}
createKeyboard();

keyboardContainer.addEventListener('click', e=>{
  if(!e.target.classList.contains('key')) return;
  let k=e.target.textContent;
  if(k==='←') input.value=input.value.slice(0,-1);
  else if(k==='Enter') searchGoogle();
  else if(k==='Espaço') input.value+=' ';
  else input.value+=k;
});

keyboardBtn.addEventListener('click', ()=>{
  keyboardContainer.classList.toggle('hidden');
});

let dragging=false, offsetX, offsetY;
keyboardContainer.addEventListener('mousedown', e=>{
  if(e.target.classList.contains('key')) return;
  dragging=true;
  offsetX=e.clientX-keyboardContainer.offsetLeft;
  offsetY=e.clientY-keyboardContainer.offsetTop;
  keyboardContainer.style.position='absolute';
  keyboardContainer.style.bottom='auto';
  keyboardContainer.style.right='auto';
});
document.addEventListener('mousemove', e=>{
  if(!dragging) return;
  keyboardContainer.style.left=(e.clientX-offsetX)+'px';
  keyboardContainer.style.top=(e.clientY-offsetY)+'px';
});
document.addEventListener('mouseup', ()=>{ dragging=false; });

if('serviceWorker' in navigator){ navigator.serviceWorker.register('service-worker.js'); }

window.addEventListener('offline', ()=>{
  document.body.innerHTML='<div style="text-align:center"><h2>Sem conexão</h2><canvas id="offline-dino" width="600" height="150" style="border:1px solid #ccc;"></canvas></div>';
  const canvas=document.getElementById('offline-dino');
  const ctx=canvas.getContext('2d');
  ctx.font='20px Arial';
  ctx.fillText('⚠️ Sem internet! Abra o jogo do Dinossauro aqui!',10,50);
});
