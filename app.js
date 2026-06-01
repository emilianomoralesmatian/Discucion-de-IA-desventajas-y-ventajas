const STORAGE_KEY = 'ia_forum_topics_v1'

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}

function loadTopics(){
  try{const t=localStorage.getItem(STORAGE_KEY);return t?JSON.parse(t):[] }catch(e){return[]}
}

function saveTopics(topics){localStorage.setItem(STORAGE_KEY,JSON.stringify(topics))}

function renderTopics(filter=''){const list=document.getElementById('topics-list');list.innerHTML='';
  const topics=loadTopics().filter(t=> (t.title+t.body+(t.author||'')).toLowerCase().includes(filter.toLowerCase())).sort((a,b)=>b.created-a.created)
  if(topics.length===0){list.innerHTML='<li class="meta">No hay temas todavía.</li>';return}
  topics.forEach(t=>{
    const li=document.createElement('li');li.className='topic'
    const left=document.createElement('div');
    left.style.flex='1'
    left.innerHTML=`<strong>${escapeHtml(t.title)}</strong><div class="meta">${escapeHtml(t.author||'Anon')} · ${new Date(t.created).toLocaleString()}</div><div class="meta">${escapeHtml(t.body.slice(0,200))}${t.body.length>200?'…':''}</div>`
    const right=document.createElement('div');
    const tag=document.createElement('span');tag.className='tag '+(t.type==='pro'?'pro':t.type==='con'?'con':'');tag.textContent=t.type==='pro'? 'Ventaja': t.type==='con' ? 'Desventaja' : 'Discusión'
    const btn=document.createElement('button');btn.textContent='Ver';btn.onclick=()=>openThread(t.id)
    right.appendChild(tag);right.appendChild(document.createElement('br'));right.appendChild(btn)
    li.appendChild(left);li.appendChild(right);list.appendChild(li)
  })
}

function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]))}

function createTopic(e){e.preventDefault();
  const title=document.getElementById('topic-title').value.trim();
  const body=document.getElementById('topic-body').value.trim();
  if(!title||!body) return
  const author=document.getElementById('topic-author').value.trim();
  const type=document.getElementById('topic-type').value
  const topics=loadTopics()
  const t={id:uid(),title,body,author,type,created:Date.now(),comments:[]}
  topics.push(t); saveTopics(topics); document.getElementById('topic-form').reset(); renderTopics(document.getElementById('search').value)
}

function openThread(id){
  const topics=loadTopics(); const t=topics.find(x=>x.id===id); if(!t) return
  document.getElementById('thread-article').innerHTML=`<h3>${escapeHtml(t.title)}</h3><div class="meta">${escapeHtml(t.author||'Anon')} · ${new Date(t.created).toLocaleString()}</div><p>${escapeHtml(t.body)}</p><h4>Respuestas (${t.comments.length})</h4>`
  const ul=document.createElement('ul'); ul.style.listStyle='none'; ul.style.padding='0'
  t.comments.forEach(c=>{const li=document.createElement('li'); li.style.padding='8px 0'; li.innerHTML=`<div class="meta">${escapeHtml(c.author||'Anon')} · ${new Date(c.created).toLocaleString()}</div><div>${escapeHtml(c.body)}</div>`; ul.appendChild(li)})
  document.getElementById('thread-article').appendChild(ul)
  document.getElementById('thread').classList.remove('hidden')
  document.getElementById('new-topic').classList.add('hidden')
  document.getElementById('topics').classList.add('hidden')
  document.getElementById('comment-form').onsubmit=(ev)=>{ev.preventDefault();addComment(id)}
}

function addComment(topicId){const author=document.getElementById('comment-author').value.trim();const body=document.getElementById('comment-body').value.trim();if(!body) return
  const topics=loadTopics();const t=topics.find(x=>x.id===topicId); if(!t) return
  t.comments.push({id:uid(),author,body,created:Date.now()}); saveTopics(topics); document.getElementById('comment-form').reset(); openThread(topicId)
}

function backToList(){document.getElementById('thread').classList.add('hidden'); document.getElementById('new-topic').classList.remove('hidden'); document.getElementById('topics').classList.remove('hidden'); renderTopics(document.getElementById('search').value)}

function clearStorage(){if(!confirm('Borrar todo el contenido del foro en este navegador?')) return; localStorage.removeItem(STORAGE_KEY); renderTopics()}

function init(){document.getElementById('topic-form').addEventListener('submit',createTopic); document.getElementById('back').addEventListener('click',backToList); document.getElementById('clear-storage').addEventListener('click',clearStorage);
  document.getElementById('search').addEventListener('input',e=>renderTopics(e.target.value)); renderTopics()
}

document.addEventListener('DOMContentLoaded',init)