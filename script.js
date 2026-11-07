
// ==========================================
// PROJETO EVOLUÇÃO
// JAVASCRIPT COMPLETO
// ==========================================

// ATRIBUTOS DO PERSONAGEM
const atributos = {
  forca: "Força",
  inteligencia: "Inteligência",
  velocidade: "Velocidade",
  saude: "Saúde",
  resistencia: "Resistência",
  sabedoria: "Sabedoria",
  carisma: "Carisma"
};

// SISTEMA DE RANKS
const ranks = [
  { nome: "F", xp: 0 },
  { nome: "E", xp: 100 },
  { nome: "D", xp: 250 },
  { nome: "C", xp: 500 },
  { nome: "B", xp: 900 },
  { nome: "A", xp: 1500 },
  { nome: "S", xp: 2500 },
  { nome: "SS", xp: 4000 }
];

// ESTADO INICIAL
const estadoInicial = {
  nome: "",
  foto: "",
  xp: 0,

  missoes: [],

  stats: {
    forca: 0,
    inteligencia: 0,
    velocidade: 0,
    saude: 0,
    resistencia: 0,
    sabedoria: 0,
    carisma: 0
  },

  conquistas: [],
  historico: [],

  ultimaData: new Date().toLocaleDateString("pt-BR")
};

// CARREGAR DADOS SALVOS
function carregarEstado() {
  try {
    const salvo = JSON.parse(
      localStorage.getItem("projetoEvolucao")
    );

    if (!salvo) {
      return structuredClone(estadoInicial);
    }

    return {
      ...structuredClone(estadoInicial),
      ...salvo,

      stats: {
        ...estadoInicial.stats,
        ...(salvo.stats || {})
      }
    };

  } catch {
    return structuredClone(estadoInicial);
  }
}

let estado = carregarEstado();

// SALVAR DADOS
function salvar() {
  localStorage.setItem(
    "projetoEvolucao",
    JSON.stringify(estado)
  );
}

// ==========================================
// SISTEMA DE PERFIL
// ==========================================

function configurarPerfil() {

  const nomeInput = document.getElementById("playerName");
  const fotoInput = document.getElementById("profilePhoto");
  const preview = document.getElementById("profilePreview");

  // CARREGAR NICKNAME
  nomeInput.value = estado.nome || "";

  // CARREGAR FOTO
  if (estado.foto) {
    preview.src = estado.foto;
  }

  // SALVAR NICKNAME
  nomeInput.addEventListener("input", () => {

    estado.nome = nomeInput.value;

    salvar();

  });

  // SELECIONAR FOTO
  fotoInput.addEventListener("change", () => {

    const arquivo = fotoInput.files[0];

    if (!arquivo) return;

    // VERIFICAR SE É UMA IMAGEM
    if (!arquivo.type.startsWith("image/")) {

      alert("Selecione um arquivo de imagem válido.");

      fotoInput.value = "";

      return;
    }

    // LIMITE DE 2 MB
    if (arquivo.size > 2 * 1024 * 1024) {

      alert("A imagem deve ter no máximo 2 MB.");

      fotoInput.value = "";

      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {

      estado.foto = leitor.result;

      preview.src = leitor.result;

      salvar();

    };

    leitor.readAsDataURL(arquivo);

  });

}

// ==========================================
// SISTEMA DE RANK
// ==========================================

function atualizarRank() {

  let rankAtual = ranks[0];

  for (const rank of ranks) {

    if (estado.xp >= rank.xp) {

      rankAtual = rank;

    }

  }

  document.getElementById("rank").textContent =
    rankAtual.nome;

  document.getElementById("xp").textContent =
    estado.xp;

  const proximo = ranks.find(
    rank => rank.xp > estado.xp
  );

  let progresso = 100;

  if (proximo) {

    progresso =
      ((estado.xp - rankAtual.xp) /
      (proximo.xp - rankAtual.xp)) * 100;

  }

  document.getElementById("xpBar").style.width =
    progresso + "%";

}

// ==========================================
// STATUS DO PERSONAGEM
// ==========================================

function renderizarStatus() {

  const lista = document.getElementById("statusList");

  lista.innerHTML = "";

  for (const chave in atributos) {

    const pontos = estado.stats[chave] || 0;

    const elemento = document.createElement("div");

    elemento.className = "status";

    const info = document.createElement("div");

    info.className = "status-info";

    const nome = document.createElement("span");

    nome.textContent = atributos[chave];

    const valor = document.createElement("strong");

    valor.textContent = pontos + " pontos";

    info.append(nome, valor);

    const barra = document.createElement("div");

    barra.className = "status-bar";

    const preenchimento = document.createElement("div");

    preenchimento.className = "status-fill";

    preenchimento.style.width =
      Math.min(pontos, 100) + "%";

    barra.appendChild(preenchimento);

    elemento.append(info, barra);

    lista.appendChild(elemento);

  }

}

// ==========================================
// SISTEMA DE MISSÕES
// ==========================================

function renderizarMissoes() {

  const lista = document.getElementById("missionList");

  lista.innerHTML = "";

  estado.missoes.forEach(missao => {

    const item = document.createElement("div");

    item.className = "missao";

    if (missao.concluida) {

      item.classList.add("concluida");

    }

    const descricao = document.createElement("span");

    const atributo = atributos[missao.atributo] || "Força";

    descricao.textContent =
      `${missao.nome} — ${missao.xp} XP — ${atributo}`;

    const botoes = document.createElement("div");

    const concluir = document.createElement("button");

    concluir.textContent =
      missao.concluida ? "Desfazer" : "Concluir";

    concluir.addEventListener("click", () => {

      concluirMissao(missao.id);

    });

    const excluir = document.createElement("button");

    excluir.textContent = "Excluir";

    excluir.addEventListener("click", () => {

      excluirMissao(missao.id);

    });

    botoes.append(concluir, excluir);

    item.append(descricao, botoes);

    lista.appendChild(item);

  });

}

// ADICIONAR MISSÃO
function adicionarMissao() {

  const nome = document
    .getElementById("missionName")
    .value.trim();

  const xp = Number(
    document.getElementById("missionDifficulty").value
  );

  const atributo =
    document.getElementById("missionStat").value;

  if (!nome) {

    alert("Digite o nome da missão!");

    return;

  }

  estado.missoes.push({

    id: Date.now(),

    nome,

    xp,

    atributo,

    concluida: false

  });

  document.getElementById("missionName").value = "";

  atualizarTudo();

}

// CONCLUIR OU DESFAZER MISSÃO
function concluirMissao(id) {

  const missao = estado.missoes.find(
    m => m.id === id
  );

  if (!missao) return;

  const atributo = atributos[missao.atributo]
    ? missao.atributo
    : "forca";

  if (!missao.concluida) {

    missao.concluida = true;

    estado.xp += missao.xp;

    estado.stats[atributo] =
      (estado.stats[atributo] || 0) + 1;

    estado.historico.push({

      nome: missao.nome,

      data: new Date().toLocaleDateString("pt-BR")

    });

  } else {

    missao.concluida = false;

    estado.xp = Math.max(
      0,
      estado.xp - missao.xp
    );

    estado.stats[atributo] = Math.max(
      0,
      (estado.stats[atributo] || 0) - 1
    );

  }

  atualizarTudo();

}

// EXCLUIR MISSÃO
function excluirMissao(id) {

  estado.missoes = estado.missoes.filter(
    m => m.id !== id
  );

  atualizarTudo();

}

// ==========================================
// HISTÓRICO
// ==========================================

function renderizarHistorico() {

  const lista = document.getElementById("history");

  lista.innerHTML = "";

  estado.historico.slice().reverse().forEach(registro => {

    const item = document.createElement("p");

    item.textContent =
      `${registro.data} — ${registro.nome}`;

    lista.appendChild(item);

  });

}

// ==========================================
// CONQUISTAS
// ==========================================

function renderizarConquistas() {

  const lista = document.getElementById("achievements");

  lista.innerHTML = "";

  const total = estado.historico.length;

  const conquistas = [

    { nome: "Primeiro passo", meta: 1 },

    { nome: "Em evolução", meta: 10 },

    { nome: "Persistência", meta: 25 },

    { nome: "Lenda", meta: 50 }

  ];

  conquistas.forEach(conquista => {

    const desbloqueada = total >= conquista.meta;

    const item = document.createElement("p");

    item.textContent =
      `${desbloqueada ? "🏆" : "🔒"} ${conquista.nome}`;

    lista.appendChild(item);

  });

}

// ==========================================
// ATUALIZAR TODO O SITE
// ==========================================

function atualizarTudo() {

  document.getElementById("playerName").value =
    estado.nome || "";

  atualizarRank();

  renderizarStatus();

  renderizarMissoes();

  renderizarHistorico();

  renderizarConquistas();

  salvar();

}

// ==========================================
// EVENTOS DOS BOTÕES
// ==========================================

document.getElementById("addMission")
  .addEventListener("click", adicionarMissao);

document.getElementById("themeButton")
  .addEventListener("click", () => {

    document.body.classList.toggle("light");

  });

document.getElementById("resetButton")
  .addEventListener("click", () => {

    if (confirm("Deseja realmente reiniciar todo o progresso?")) {

      estado = structuredClone(estadoInicial);

      atualizarTudo();

      const preview = document.getElementById("profilePreview");

      preview.src =
        "https://placehold.co/150x150/30394d/ffffff?text=Perfil";

    }

  });

// ==========================================
// INICIALIZAÇÃO
// ==========================================

configurarPerfil();

atualizarTudo();

