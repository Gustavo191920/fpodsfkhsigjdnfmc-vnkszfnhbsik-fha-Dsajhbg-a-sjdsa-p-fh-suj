import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, push, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD1s59lUfko_WNkmtBFI1iL2Dnd87IxGrU",
  authDomain: "zenith-cloud-fff6b.firebaseapp.com",
  databaseURL: "https://zenith-cloud-fff6b-default-rtdb.firebaseio.com",
  projectId: "zenith-cloud-fff6b",
  storageBucket: "zenith-cloud-fff6b.firebasestorage.app",
  messagingSenderId: "582768847823",
  appId: "1:582768847823:web:0f05af495fff5eef1240ba",
  measurementId: "G-NPWB7X34EJ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const luaEditor = document.getElementById("luaEditor");
const scriptTitle = document.getElementById("scriptTitle");
const saveBtn = document.getElementById("saveBtn");
const copyLoadstringBtn = document.getElementById("copyLoadstringBtn");
const rawUrl = document.getElementById("rawUrl");
const loadstringCode = document.getElementById("loadstringCode");
const loadstringUrl = document.getElementById("loadstringUrl");
const savedList = document.getElementById("savedList");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");

let currentRawId = null;

function getBaseUrl() {
  return window.location.origin;
}

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function generateId() {
  return "z_" + Math.random().toString(36).slice(2, 12);
}

function updateRawDisplay(id) {
  currentRawId = id;
  const url = `${getBaseUrl()}/api/raw/${id}`;
  rawUrl.textContent = url;
  loadstringUrl.textContent = url;
  loadstringCode.style.display = "block";
}

async function saveScript() {
  const content = luaEditor.value.trim();
  if (!content) {
    showToast("Cole ou escreva um script primeiro!", true);
    return;
  }

  saveBtn.classList.add("loading");
  saveBtn.disabled = true;

  try {
    const id = generateId();
    const title = scriptTitle.value.trim() || `Script ${new Date().toLocaleDateString("pt-BR")}`;
    const scriptRef = ref(db, `scripts/${id}`);

    await set(scriptRef, {
      content,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    updateRawDisplay(id);
    showToast("Script salvo com sucesso!");
    scriptTitle.value = "";
    loadSavedScripts();
  } catch (err) {
    console.error(err);
    showToast("Erro ao salvar. Verifique as regras do Firebase.", true);
  } finally {
    saveBtn.classList.remove("loading");
    saveBtn.disabled = false;
  }
}

function copyLoadstring() {
  const content = luaEditor.value.trim();
  if (!content) {
    showToast("Cole ou escreva um script primeiro!", true);
    return;
  }

  let url;
  if (currentRawId) {
    url = `${getBaseUrl()}/api/raw/${currentRawId}`;
  } else {
    const blob = new Blob([content], { type: "text/plain" });
    const dataUrl = URL.createObjectURL(blob);
    showToast("Salve o script primeiro para obter uma URL permanente. Ou use a URL temporária (data:) no DevTools.", true);
    return;
  }

  const loadstring = `loadstring(game:HttpGet("${url}"))()`;
  navigator.clipboard.writeText(loadstring).then(() => {
    showToast("Loadstring copiado!");
  }).catch(() => {
    showToast("Erro ao copiar.", true);
  });
}

function loadSavedScripts() {
  const scriptsRef = ref(db, "scripts");

  onValue(scriptsRef, (snapshot) => {
    const data = snapshot.val();
    const items = data ? Object.entries(data).map(([id, script]) => ({ id, ...script })) : [];
    items.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));

    savedList.querySelectorAll(".saved-item").forEach(el => el.remove());
    emptyState.style.display = items.length ? "none" : "block";

    items.forEach(({ id, title, content }) => {
      const url = `${getBaseUrl()}/api/raw/${id}`;
      const el = document.createElement("div");
      el.className = "saved-item";
      el.innerHTML = `
        <div class="saved-item-info">
          <div class="saved-item-title">${escapeHtml(title)}</div>
          <div class="saved-item-url">${escapeHtml(url)}</div>
        </div>
        <div class="saved-item-actions">
          <button class="btn btn-secondary btn-copy-raw">Copiar Raw</button>
          <button class="btn btn-secondary btn-load">Carregar</button>
        </div>
      `;

      el.querySelector(".btn-copy-raw").addEventListener("click", () => {
        navigator.clipboard.writeText(url);
        showToast("URL Raw copiada!");
      });

      el.querySelector(".btn-load").addEventListener("click", () => {
        luaEditor.value = content;
        scriptTitle.value = title;
        updateRawDisplay(id);
        showToast("Script carregado!");
      });

      savedList.appendChild(el);
    });
  }, (err) => {
    console.error("Erro ao carregar scripts:", err);
    emptyState.style.display = "block";
    emptyState.textContent = "Erro ao carregar scripts. Verifique as regras do Firebase.";
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

saveBtn.addEventListener("click", saveScript);
copyLoadstringBtn.addEventListener("click", copyLoadstring);

luaEditor.addEventListener("input", () => {
  if (!currentRawId) {
    rawUrl.textContent = "Salve o script para obter uma URL permanente";
    loadstringCode.style.display = "none";
  }
});

loadSavedScripts();
