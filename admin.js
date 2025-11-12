// admin.js - painel Forja Suplementos v2 (salva em localStorage)
const ADMIN_PASS = 'Tenes475326.'; // senha definida pelo usuário
let dados = { categorias: [], produtos: [] };

async function carregar(){
  // tenta localStorage primeiro
  const local = localStorage.getItem('forja_dados');
  if(local){
    try{ dados = JSON.parse(local); atualizarListas(); return; }catch(e){ console.warn('localStorage inválido'); }
  }
  try{
    const res = await fetch('produtos.json');
    dados = await res.json();
  }catch(e){
    dados = {
      categorias: ['Whey Protein','Creatina','BCAA','Pré-Treino'],
      produtos: [
        {id:1, nome:'Whey Protein - Sabor Baunilha', categoria:'Whey Protein', preco:99.90, img:'https://via.placeholder.com/400x300?text=Whey+Baunilha'},
        {id:2, nome:'Creatina Monohidratada 300g', categoria:'Creatina', preco:79.90, img:'https://via.placeholder.com/400x300?text=Creatina'},
        {id:3, nome:'BCAA 2:1:1 120caps', categoria:'BCAA', preco:59.90, img:'https://via.placeholder.com/400x300?text=BCAA'},
        {id:4, nome:'Pré-Treino Energia 200g', categoria:'Pré-Treino', preco:89.90, img:'https://via.placeholder.com/400x300?text=Pre-Treino'}
      ]
    };
  }
  atualizarListas();
}

function login(){
  const senha = document.getElementById('senha').value;
  if(senha === ADMIN_PASS){
    document.getElementById('loginCard').style.display = 'none';
    document.getElementById('painel').style.display = 'block';
    carregar();
  }else{
    alert('Senha incorreta!');
  }
}

function atualizarListas(){
  const listaCat = document.getElementById('listaCategorias');
  const listaProd = document.getElementById('listaProdutos');
  const select = document.getElementById('categoriaSelect');
  listaCat.innerHTML = '';
  listaProd.innerHTML = '';
  select.innerHTML = '';
  dados.categorias.forEach(c=>{
    const li = document.createElement('li');
    li.textContent = c + ' ';
    const btnDel = document.createElement('button'); btnDel.textContent='Remover'; btnDel.className='btn';
    btnDel.onclick = ()=>{ if(confirm('Remover categoria?')){ dados.categorias = dados.categorias.filter(x=>x!==c); atualizarListas(); } };
    li.appendChild(btnDel);
    listaCat.appendChild(li);
    const opt = document.createElement('option'); opt.value=c; opt.textContent=c; select.appendChild(opt);
  });

  dados.produtos.forEach(p=>{
    const li = document.createElement('li');
    li.innerHTML = `<strong>${p.nome}</strong> - R$ ${Number(p.preco).toFixed(2)} (${p.categoria}) `;
    const btnEdit = document.createElement('button'); btnEdit.textContent='Editar'; btnEdit.className='btn';
    btnEdit.onclick = ()=> editarProduto(p.id);
    const btnDel = document.createElement('button'); btnDel.textContent='Excluir'; btnDel.className='btn';
    btnDel.onclick = ()=> { if(confirm('Excluir produto?')){ dados.produtos = dados.produtos.filter(x=>x.id!==p.id); atualizarListas(); } };
    li.appendChild(btnEdit); li.appendChild(btnDel);
    listaProd.appendChild(li);
  });
}

function addCategoria(){
  const cat = document.getElementById('novaCategoria').value.trim();
  if(!cat) return alert('Digite um nome de categoria.');
  if(dados.categorias.includes(cat)) return alert('Categoria já existe.');
  dados.categorias.push(cat);
  document.getElementById('novaCategoria').value='';
  atualizarListas();
}

function addProduto(){
  const nome = document.getElementById('nome').value.trim();
  const preco = parseFloat(document.getElementById('preco').value);
  const img = document.getElementById('img').value.trim() || 'https://via.placeholder.com/400x300?text=Produto';
  const categoria = document.getElementById('categoriaSelect').value;
  if(!nome || !categoria || isNaN(preco)) return alert('Preencha nome, preço e categoria corretamente.');
  const id = Date.now();
  dados.produtos.push({id, nome, preco, img, categoria});
  document.getElementById('nome').value=''; document.getElementById('preco').value=''; document.getElementById('img').value='';
  atualizarListas();
}

function editarProduto(id){
  const p = dados.produtos.find(x=>x.id===id);
  if(!p) return;
  const novoNome = prompt('Nome', p.nome);
  if(novoNome===null) return;
  const novoPreco = prompt('Preço (use ponto)', p.preco);
  if(novoPreco===null) return;
  const novaImg = prompt('URL da imagem', p.img);
  if(novaImg===null) return;
  const novaCat = prompt('Categoria', p.categoria);
  if(novaCat===null) return;
  p.nome = novoNome; p.preco = parseFloat(novoPreco); p.img = novaImg; p.categoria = novaCat;
  if(!dados.categorias.includes(p.categoria)) dados.categorias.push(p.categoria);
  atualizarListas();
}

function salvarAlteracoes(){
  // salva no localStorage e dispara evento storage para outras abas
  try{
    localStorage.setItem('forja_dados', JSON.stringify(dados));
    // também dispara um evento custom para a mesma aba
    window.dispatchEvent(new Event('storage'));
    alert('Alterações salvas! A loja foi atualizada (localStorage).');
  }catch(e){
    alert('Erro ao salvar alterações: ' + e.message);
  }
}

function exportar(){
  const blob = new Blob([JSON.stringify(dados, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'produtos.json';
  a.click();
}

function importar(){
  const input = document.createElement('input');
  input.type='file'; input.accept='.json';
  input.onchange = e=>{
    const f = e.target.files[0];
    const reader = new FileReader();
    reader.onload = ev=>{
      try{
        const j = JSON.parse(ev.target.result);
        if(j.produtos && j.categorias){ dados = j; atualizarListas(); alert('Arquivo importado com sucesso.'); } else alert('Arquivo JSON inválido.');
      }catch(err){ alert('Erro ao ler JSON.'); }
    };
    reader.readAsText(f);
  };
  input.click();
}
