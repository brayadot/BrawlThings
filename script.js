// ===== FIREBASE (compat) =====
const firebaseConfig = {
  apiKey: "AIzaSyDib7UvblZ70m-bK6G-CPLb-Tu6Wiw5CGk",
  authDomain: "brawlthings-c8be1.firebaseapp.com",
  projectId: "brawlthings-c8be1",
  storageBucket: "brawlthings-c8be1.appspot.com",
  messagingSenderId: "687457539690",
  appId: "1:687457539690:web:d70077499cf990d43d5c13"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// ===== ABAS =====
function showTab(id, btn) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active-section"));
  document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));

  document.getElementById(id).classList.add("active-section");
  btn.classList.add("active");
}
window.showTab = showTab;

// ===== MODAL =====
function abrirModal(nomeMapa) {
  const modal = document.getElementById("mapModal");
  const titulo = document.getElementById("modalMapaNome");

  titulo.innerText = nomeMapa;
  modal.style.display = "flex";
}
window.abrirModal = abrirModal;

function fecharModal() {
  document.getElementById("mapModal").style.display = "none";
}
window.fecharModal = fecharModal;

// ===== MAPAS (SEM API POR ENQUANTO - TESTE) =====
const mapasFake = [
  { name: "Hard Rock Mine", imageUrl: "https://via.placeholder.com/150" },
  { name: "Double Swoosh", imageUrl: "https://via.placeholder.com/150" }
];

const container = document.getElementById("mapas");

if (container) {
  mapasFake.forEach(m => {
    const div = document.createElement("div");
    div.className = "card";
    div.style.width = "160px";
    div.style.cursor = "pointer";

    div.innerHTML = `
      <img src="${m.imageUrl}" style="width:100%;border-radius:10px;">
      <h4>${m.name}</h4>
    `;

    div.onclick = () => abrirModal(m.name);

    container.appendChild(div);
  });
}

// ===== LOGIN =====
function registrar() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  auth.createUserWithEmailAndPassword(email, senha)
    .then(() => alert("Conta criada!"))
    .catch(err => alert(err.message));
}
window.registrar = registrar;

function logar() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  auth.signInWithEmailAndPassword(email, senha)
    .then(() => alert("Logado com sucesso!"))
    .catch(err => alert(err.message));
}
window.logar = logar;

auth.onAuthStateChanged(user => {
  const status = document.getElementById("userStatus");
  if (status) {
    status.innerText = user ? `Logado: ${user.email}` : "Não logado";
  }
});

// ===== DIVULGAÇÃO =====
function divulgar() {
  const user = auth.currentUser;
  if (!user) return alert("Faça login primeiro!");

  const nome = document.getElementById("nome").value;
  const desc = document.getElementById("desc").value;
  const link = document.getElementById("link").value;

  if (!nome || !desc || !link) {
    return alert("Preencha todos os campos!");
  }

  db.collection("divulgacoes").add({
    nome,
    descricao: desc,
    link,
    autor: user.email,
    data: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById("nome").value = "";
  document.getElementById("desc").value = "";
  document.getElementById("link").value = "";
}
window.divulgar = divulgar;

db.collection("divulgacoes")
  .orderBy("data", "desc")
  .onSnapshot(snapshot => {
    const lista = document.getElementById("lista");
    if (!lista) return;

    lista.innerHTML = "";
    snapshot.forEach(doc => {
      const d = doc.data();
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <h3>${d.nome}</h3>
        <p>${d.descricao}</p>
        <small>${d.autor}</small><br>
        <a href="${d.link}" target="_blank">Entrar</a>
      `;
      lista.appendChild(div);
    });
  });
  
  // ===== ADMIN =====
const ADMIN_EMAIL = "eubrayanoliveira@gmail.com";

// ===== NOTÍCIAS =====
function publicarNoticia() {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) {
    return alert("Sem permissão");
  }

  const titulo = document.getElementById("newsTitle").value;
  const conteudo = document.getElementById("newsContent").value;

  if (!titulo || !conteudo) {
    return alert("Preencha tudo");
  }

  db.collection("news").add({
    titulo,
    conteudo,
    autor: user.email,
    data: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById("newsTitle").value = "";
  document.getElementById("newsContent").value = "";
}
window.publicarNoticia = publicarNoticia;

// ===== LISTAR NOTÍCIAS =====
db.collection("news")
  .orderBy("data", "desc")
  .onSnapshot(snapshot => {
    const list = document.getElementById("newsList");
    if (!list) return;

    list.innerHTML = "";

    snapshot.forEach(doc => {
      const n = doc.data();
      const div = document.createElement("div");
      div.className = "card";

      const data = n.data?.toDate
        ? n.data.toDate().toLocaleDateString("pt-BR")
        : "";

      div.innerHTML = `
        <h3>${n.titulo}</h3>
        <small>${data} • ${n.autor}</small>
        <p>${n.conteudo}</p>
      `;

      list.appendChild(div);
    });
  });

// ===== MOSTRAR PAINEL ADMIN =====
auth.onAuthStateChanged(user => {
  const adminPanel = document.getElementById("adminPanel");
  if (!adminPanel) return;

  if (user && user.email === ADMIN_EMAIL) {
    adminPanel.style.display = "block";
  } else {
    adminPanel.style.display = "none";
  }
});

let noticiaEditandoId = null;

function publicarNoticia() {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) return;

  const titulo = newsTitle.value;
  const conteudo = newsContent.value;
  const imagem = newsImage.value;

  if (!titulo || !conteudo) return alert("Preencha tudo");

  const dados = {
    titulo,
    conteudo,
    imagem,
    autor: user.email,
    data: firebase.firestore.FieldValue.serverTimestamp()
  };

  if (noticiaEditandoId) {
    db.collection("news").doc(noticiaEditandoId).update(dados);
    noticiaEditandoId = null;
    cancelEdit.style.display = "none";
  } else {
    db.collection("news").add(dados);
  }

  newsTitle.value = "";
  newsContent.value = "";
  newsImage.value = "";
}
window.publicarNoticia = publicarNoticia;

function editarNoticia(id, titulo, conteudo, imagem) {
  noticiaEditandoId = id;

  newsTitle.value = titulo;
  newsContent.value = conteudo;
  newsImage.value = imagem || "";

  cancelEdit.style.display = "inline-block";
}
window.editarNoticia = editarNoticia;

function cancelarEdicao() {
  noticiaEditandoId = null;

  newsTitle.value = "";
  newsContent.value = "";
  newsImage.value = "";

  cancelEdit.style.display = "none";
}
window.cancelarEdicao = cancelarEdicao;

function apagarNoticia(id) {
  if (confirm("Apagar esta notícia?")) {
    db.collection("news").doc(id).delete();
  }
}
window.apagarNoticia = apagarNoticia;

db.collection("news")
  .orderBy("data", "desc")
  .onSnapshot(snapshot => {
    const list = document.getElementById("newsList");
    if (!list) return;

    list.innerHTML = "";

    snapshot.forEach(doc => {
      const n = doc.data();
      const div = document.createElement("div");
      div.className = "card";

      const img = n.imagem
        ? `<img src="${n.imagem}" style="width:100%;border-radius:10px;margin:10px 0;">`
        : "";

      const adminBtns =
        auth.currentUser?.email === ADMIN_EMAIL
          ? `
            <button class="action" onclick="editarNoticia('${doc.id}', \`${n.titulo}\`, \`${n.conteudo}\`, \`${n.imagem || ""}\`)">Editar</button>
            <button class="action" onclick="apagarNoticia('${doc.id}')">Apagar</button>
          `
          : "";

      div.innerHTML = `
        <h3>${n.titulo}</h3>
        ${img}
        <p>${n.conteudo}</p>
        ${adminBtns}
      `;

      list.appendChild(div);
    });
  });
