// script.js - loja Forja Suplementos v2 (carrega dados de localStorage > produtos.json)
const WHATSAPP_NUMBER = '5562986219737'; // BR + DDD + number
let dados = { categorias: [], produtos: [] };
let carrinho = [];

// Util helpers
function formatMoney(v){ return Number(v).toFixed(2).replace('.',','); }
function byId(id){return document.getElementById(id)}

// Carrega dados: primeiro tenta localStorage, depois produtos.json
async function carregarDados(){
  const local = localStorage.getItem('forja_dados');
  if(local){
    try{ dados = JSON.parse(local); popularCategorias(); renderProdutos(dados.produtos); return; }catch(e){ console.warn('localStorage inválido'); }
  }
  try{
    const res = await fetch('produtos.json');
    dados = await res.json();
  }catch(e){
    console.warn('Não foi possível carregar produtos.json localmente. Usando fallback.');
    dados = {
      categorias: ['Whey Protein','Creatina','BCAA','Pré-Treino'],
      produtos: [
        {id:1, nome:'Whey Protein', categoria:'Whey Protein', preco:99.90, img:'https://via.placeholder.com/400x300?text=Whey'},
        {id:2, nome:'Creatina', categoria:'Creatina', preco:79.90, img:'https://via.placeholder.com/400x300?text=Creatina'},
        {id:3, nome:'BCAA', categoria:'BCAA', preco:59.90, img:'https://via.placeholder.com/400x300?text=BCAA'},
        {id:4, nome:'Pré-Treino', categoria:'Pré-Treino', preco:89.90, img:'https://via.placeholder.com/400x300?text=Pre-Treino'}
      ]
    };
  }
  popularCategorias();
  renderProdutos(dados.produtos);
}

function popularCategorias(){
  const sel = byId('filtroCategoria');
  sel.innerHTML = '<option value="all">Todas</option>';
  dados.categorias.forEach(c=>{
    const opt = document.createElement('option'); opt.value=c; opt.textContent=c; sel.appendChild(opt);
  });
}

// Render produtos
function renderProdutos(lista){
  const area = byId('produtos');
  area.innerHTML = '';
  lista.forEach(p=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.nome}">
      <h3>${p.nome}</h3>
      <p class="preco">R$ ${formatMoney(p.preco)}</p>
      <p>${p.categoria}</p>
      <div><button class="btn" onclick="adicionar(${p.id})">Adicionar</button></div>
    `;
    area.appendChild(card);
  });
}

function adicionar(id){
  const item = dados.produtos.find(x=>x.id===id);
  if(!item) return;
  carrinho.push({...item});
  byId('qtdItens').textContent = carrinho.length;
  alert(item.nome + ' adicionado ao carrinho.');
}

byId('verCarrinho').addEventListener('click', ()=>{ abrirCarrinho(); });

function abrirCarrinho(){
  const lista = byId('listaCarrinho');
  lista.innerHTML = '';
  let soma = 0;
  if(carrinho.length===0) lista.innerHTML = '<li>Seu carrinho está vazio.</li>';
  carrinho.forEach((it, idx)=>{
    const li = document.createElement('li');
    li.innerHTML = `${it.nome} - R$ ${formatMoney(it.preco)} <button onclick="remover(${idx})" class="btn">x</button>`;
    lista.appendChild(li);
    soma += Number(it.preco);
  });
  byId('total').textContent = formatMoney(soma);
  byId('carrinhoModal').style.display = 'flex';
}

function remover(idx){
  carrinho.splice(idx,1);
  byId('qtdItens').textContent = carrinho.length;
  abrirCarrinho();
}

byId('fecharCarrinho').addEventListener('click', ()=>{ byId('carrinhoModal').style.display = 'none'; });

byId('enviarWhatsapp').addEventListener('click', ()=>{
  if(carrinho.length===0){ alert('Seu carrinho está vazio.'); return; }
  let nomeCliente = byId('clienteNome').value || '';
  let obs = byId('observacoes').value || '';
  let msg = '*Pedido - Forja Suplementos*%0A';
  if(nomeCliente) msg += 'Cliente: ' + encodeURIComponent(nomeCliente) + '%0A';
  msg += '%0A';
  let total = 0;
  carrinho.forEach(it=>{
    msg += `• ${it.nome} - R$ ${formatMoney(it.preco)}%0A`;
    total += Number(it.preco);
  });
  msg += '%0ATotal: R$ ' + formatMoney(total) + '%0A';
  if(obs) msg += '%0AObservações: ' + encodeURIComponent(obs) + '%0A';
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  window.open(url, '_blank');
});

// filtros e busca
byId('filtroCategoria').addEventListener('change', ()=>{
  const v = byId('filtroCategoria').value;
  const busca = byId('buscar').value.toLowerCase();
  let lista = dados.produtos.filter(p => (v==='all' || p.categoria===v));
  if(busca) lista = lista.filter(p => p.nome.toLowerCase().includes(busca) || (p.categoria||'').toLowerCase().includes(busca));
  renderProdutos(lista);
});
byId('buscar').addEventListener('input', ()=>{
  const event = new Event('change');
  byId('filtroCategoria').dispatchEvent(event);
});

// escuta mudanças de storage (quando admin salva em outra aba)
window.addEventListener('storage', (e)=>{
  if(e.key === 'forja_dados'){
    try{ dados = JSON.parse(e.newValue); popularCategorias(); renderProdutos(dados.produtos); }
    catch(err){ console.warn('Erro ao parsear forja_dados do storage'); }
  }
});

// inicia
carregarDados();
