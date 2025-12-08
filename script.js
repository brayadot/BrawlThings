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