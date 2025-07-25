const itensPorPagina = 5;
let paginaAtual = 1;
let listaAtual = [];

async function carregarProdutos() {
  try {
    const token = localStorage.getItem('token');
    const resposta = await fetch('https://labengsoftware.onrender.com/api/produtosmostrar/mostrar', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials : 'include'
    });
    if (!resposta.ok) throw new Error("Erro ao carregar produtos");
    const dados = await resposta.json();
    listaAtual = dados;
    atualizarTabela();
  } catch (erro) {
    console.error("Erro ao buscar produtos:", erro);
  }
}

function mostrarProdutos(pagina) {
  const inicio = (pagina - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const produtosPagina = listaAtual.slice(inicio, fim);
  const tbody = document.getElementById("tbody");
  tbody.innerHTML = "";

  produtosPagina.forEach((produto, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
    <td>${produto.nome}</td>
    <td>${produto.categoria}</td>
    <td>${produto.validade}</td>
    <td>${produto.fornecedor}</td>
    <td>${produto.numero_serie}</td>
    <td>
        <div class="quantidade-container">
        <button class="subtrairBtn" data-index="${index}" title="Diminuir">➖</button>
        <input 
            type="number" 
            min="0" 
            class="quantidadeInput"
            data-produto-id="${produto.id_produto}"
            data-lote-id="${produto.id_lote}"
            data-original="${produto.quantidade}"
            value="${produto.quantidade}"
            />

        <button class="adicionarBtn" data-index="${index}" title="Adicionar">➕</button>
        </div>
    </td>
    <td>
        <button class="botao-editar" onclick="editarProduto(${produto.id_produto}, ${produto.id_lote})">✅</button>
    </td>
    `;



    tbody.appendChild(tr);
  });

document.querySelectorAll(".adicionarBtn").forEach(btn => {
  btn.addEventListener("click", e => {
    const produtoId = e.target.closest('tr').querySelector('.quantidadeInput').dataset.produtoId;
    const loteId = e.target.closest('tr').querySelector('.quantidadeInput').dataset.loteId;
    const input = document.querySelector(`input.quantidadeInput[data-produto-id="${produtoId}"][data-lote-id="${loteId}"]`);
    input.value = parseInt(input.value) + 1;
    input.dispatchEvent(new Event('change'));
  });
});

document.querySelectorAll(".subtrairBtn").forEach(btn => {
  btn.addEventListener("click", e => {
    const produtoId = e.target.closest('tr').querySelector('.quantidadeInput').dataset.produtoId;
    const loteId = e.target.closest('tr').querySelector('.quantidadeInput').dataset.loteId;
    const input = document.querySelector(`input.quantidadeInput[data-produto-id="${produtoId}"][data-lote-id="${loteId}"]`);
    if (input.value > 0) {
      input.value = parseInt(input.value) - 1;
      input.dispatchEvent(new Event('change'));
    }
  });
});


  document.querySelectorAll(".quantidadeInput").forEach(input => {
    input.addEventListener("change", e => {
      const idx = parseInt(e.target.dataset.index);
      const novoValor = parseInt(e.target.value);
      listaAtual[(paginaAtual - 1) * itensPorPagina + idx].quantidade = isNaN(novoValor) || novoValor < 0 ? 0 : novoValor;
      atualizarTabela();
    });
  });

  criarPaginacao();
}


function criarPaginacao() {
  const totalPaginas = Math.ceil(listaAtual.length / itensPorPagina);
  const paginacao = document.getElementById("pagination");
  paginacao.innerHTML = "";

  if (totalPaginas > 1) {
    const anterior = document.createElement("li");
    anterior.textContent = "Anterior";
    anterior.classList.add("paginacao-item");
    anterior.onclick = () => {
      if (paginaAtual > 1) {
        paginaAtual--;
        atualizarTabela();
      }
    };
    if (paginaAtual === 1) anterior.classList.add("disabled");
    paginacao.appendChild(anterior);
  }

  for (let i = 1; i <= totalPaginas; i++) {
    const botao = document.createElement("li");
    botao.textContent = i;
    botao.classList.add("paginacao-item");
    if (paginaAtual === i) botao.classList.add("active");
    botao.onclick = () => {
      paginaAtual = i;
      atualizarTabela();
    };
    paginacao.appendChild(botao);
  }

  if (totalPaginas > 1) {
    const proxima = document.createElement("li");
    proxima.textContent = "Próxima";
    proxima.classList.add("paginacao-item");
    proxima.onclick = () => {
      if (paginaAtual < totalPaginas) {
        paginaAtual++;
        atualizarTabela();
      }
    };
    if (paginaAtual === totalPaginas) proxima.classList.add("disabled");
    paginacao.appendChild(proxima);
  }
}

function buscarProdutos() {
  const termo = document.getElementById("buscarProduto").value.toLowerCase().trim();
  if (termo === "") {
    carregarProdutos(); // Recarrega todos os produtos do banco
  } else {
    listaAtual = listaAtual.filter(p =>
      p.nome.toLowerCase().includes(termo) ||
      p.categoria.toLowerCase().includes(termo) ||
      p.fornecedor.toLowerCase().includes(termo)
    );
    paginaAtual = 1;
    atualizarTabela();
  }
}


function buscarProdutos() {
  const termo = document.getElementById("buscarProduto").value.toLowerCase().trim();
  if (termo === "") {
    carregarProdutos(); // Recarrega todos os produtos do banco
  } else {
    listaAtual = listaAtual.filter(p =>
      p.nome.toLowerCase().includes(termo) ||
      p.categoria.toLowerCase().includes(termo) ||
      p.fornecedor.toLowerCase().includes(termo)
    );
    paginaAtual = 1;
    atualizarTabela();
  }
}

function atualizarTabela() {
  mostrarProdutos(paginaAtual);
}

function editarProduto(produtoId, loteId) {
  const input = document.querySelector(`input.quantidadeInput[data-produto-id="${produtoId}"][data-lote-id="${loteId}"]`);
  const novaQuantidade = parseInt(input.value);
  const quantidadeOriginal = parseInt(input.dataset.original);

  if (isNaN(novaQuantidade)) {
    alert('Quantidade inválida!');
    input.value = quantidadeOriginal;
    return;
  }

  if (novaQuantidade === quantidadeOriginal) {
    alert('A quantidade não foi alterada.');
    return;
  }

  const tipo = novaQuantidade > quantidadeOriginal ? 'aumento' : 'diminuicao';
  const token = localStorage.getItem('token');

  fetch('/api/atualizar-quantidade', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      produtoId: parseInt(produtoId),
      loteId: parseInt(loteId),
      quantidadeAnterior: quantidadeOriginal,
      quantidadeNova: novaQuantidade,
      tipo
    })
  })
  .then(async response => {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro na requisição');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      alert(data.message);
      input.dataset.original = novaQuantidade;
      carregarProdutos(); // Recarrega os dados
    } else {
      throw new Error(data.message);
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    alert(error.message || 'Erro ao atualizar quantidade');
    input.value = quantidadeOriginal; // Reverte o valor
  });
}

// Adicionar modal para novos lotes
function criarModalNovoLote(produtoId, callback) {
  const modal = document.createElement('div');
  modal.className = 'modal-lote';
  
  // Obter data atual no formato YYYY-MM-DD
  const hoje = new Date();
  const dd = String(hoje.getDate()).padStart(2, '0');
  const mm = String(hoje.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
  const yyyy = hoje.getFullYear();
  const dataMinima = `${yyyy}-${mm}-${dd}`;
  
  modal.innerHTML = `
    <div class="modal-conteudo">
      <h3>Informações do Novo Lote</h3>
      <label>
        Data de Validade: 
        <input type="date" id="novaValidade" min="${dataMinima}" required>
      </label>
      <label>
        Número de Série: 
        <input type="text" id="novoNumeroSerie" required>
      </label>
      <div class="botoes-modal">
        <button id="confirmarLote">Confirmar</button>
        <button id="cancelarLote" type="button">Cancelar</button>
      </div>
      <p id="erroData" class="mensagem-erro" style="color: red; display: none;">
        A data de validade não pode ser anterior à data atual!
      </p>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const inputData = document.getElementById('novaValidade');
  const mensagemErro = document.getElementById('erroData');
  
  inputData.addEventListener('change', () => {
    const dataSelecionada = new Date(inputData.value);
    if (dataSelecionada < hoje) {
      mensagemErro.style.display = 'block';
      inputData.setCustomValidity('Data inválida');
    } else {
      mensagemErro.style.display = 'none';
      inputData.setCustomValidity('');
    }
  });
  
  document.getElementById('confirmarLote').addEventListener('click', () => {
    const dataValidade = inputData.value;
    const numeroSerie = document.getElementById('novoNumeroSerie').value;
    
    // Validação adicional no clique
    const dataSelecionada = new Date(dataValidade);
    if (dataSelecionada < hoje) {
      mensagemErro.style.display = 'block';
      return;
    }
    
    if (!dataValidade || !numeroSerie) {
      alert('Todos os campos são obrigatórios!');
      return;
    }
    
    document.body.removeChild(modal);
    callback(dataValidade, numeroSerie);
  });
  
  document.getElementById('cancelarLote').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
}

// Modificar a função editarProduto
function editarProduto(produtoId, loteId) {
  const input = document.querySelector(`input.quantidadeInput[data-produto-id="${produtoId}"][data-lote-id="${loteId}"]`);
  const novaQuantidade = parseInt(input.value);
  const quantidadeOriginal = parseInt(input.dataset.original);

  if (isNaN(novaQuantidade)) {
    alert('Quantidade inválida!');
    input.value = quantidadeOriginal;
    return;
  }

  if (novaQuantidade === quantidadeOriginal) {
    alert('A quantidade não foi alterada.');
    return;
  }

  const tipo = novaQuantidade > quantidadeOriginal ? 'aumento' : 'diminuicao';
  const token = localStorage.getItem('token');

  if (tipo === 'aumento') {
    criarModalNovoLote(produtoId, (dataValidade, numeroSerie) => {
      enviarAtualizacao(produtoId, loteId, quantidadeOriginal, novaQuantidade, tipo, dataValidade, numeroSerie);
    });
  } else {
    enviarAtualizacao(produtoId, loteId, quantidadeOriginal, novaQuantidade, tipo);
  }
}

function enviarAtualizacao(produtoId, loteId, quantidadeOriginal, novaQuantidade, tipo, dataValidade, numeroSerie) {
  const token = localStorage.getItem('token');
  const body = {
    produtoId: parseInt(produtoId),
    loteId: loteId ? parseInt(loteId) : null,
    quantidadeAnterior: quantidadeOriginal,
    quantidadeNova: novaQuantidade,
    tipo
  };

  if (dataValidade && numeroSerie) {
    body.dataValidade = dataValidade;
    body.numeroSerie = numeroSerie;
  }

  // Mostrar loading
  const input = document.querySelector(`input.quantidadeInput[data-produto-id="${produtoId}"][data-lote-id="${loteId}"]`);
  const originalText = input?.nextElementSibling?.innerText;
  if (input && input.nextElementSibling) {
    input.nextElementSibling.innerText = 'Processando...';
  }

  fetch('/api/atualizar-quantidade', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  })
  .then(async response => {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro na requisição');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      alert(data.message);
      carregarProdutos(); // Recarrega os dados
    } else {
      throw new Error(data.message);
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    alert(error.message || 'Erro ao atualizar quantidade');
    // Reverte o valor no input
    if (input) {
      input.value = quantidadeOriginal;
      if (input.nextElementSibling && originalText) {
        input.nextElementSibling.innerText = originalText;
      }
    }
  });
}



document.addEventListener("DOMContentLoaded", carregarProdutos);
document.getElementById("buscar").addEventListener("click", buscarProdutos);
document.getElementById("buscarProduto").addEventListener("keypress", e => {
  if (e.key === "Enter") buscarProdutos();
});
document.getElementById("buscarProduto").addEventListener("input", function () {
  if (this.value.trim() === "") carregarProdutos();
});
document.getElementById("iconUsuario").addEventListener("click", () => {
  window.open("../iconUsuario/iconUsuario,html", "_self");
});
