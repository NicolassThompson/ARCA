const appContainer = document.getElementById('app-container');
let isDashboardShellLoaded = false;

// Cache for loaded pages
const pageCache = {};

async function loadHTML(path) {
  if (pageCache[path]) {
    return pageCache[path];
  }
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    const html = await response.text();
    pageCache[path] = html;
    return html;
  } catch (error) {
    console.error(error);
    return `<div style="padding: 20px; color: red;">Erro ao carregar a página: ${path}. <br>Nota: Se estiver abrindo este arquivo localmente (file://), o navegador pode bloquear o carregamento (CORS). Use um servidor local.</div>`;
  }
}

async function showPage(page) {
  const isDash = page === 'dashboard';
  
  // Update Nav
  document.getElementById('nav-links-public').style.display = isDash ? 'none' : 'flex';
  document.getElementById('nav-links-auth').style.display = isDash ? 'flex' : 'none';
  document.getElementById('nav-cta-btn').style.display = isDash ? 'none' : 'block';
  document.getElementById('nav-user-icons').style.display = isDash ? 'flex' : 'none';

  if (isDash) {
    if (!isDashboardShellLoaded) {
      const template = document.getElementById('dashboard-shell-template').innerHTML;
      appContainer.innerHTML = template;
      isDashboardShellLoaded = true;
    }
    await showDashPage('home');
  } else {
    isDashboardShellLoaded = false; // Reset dashboard shell if leaving dashboard
    const html = await loadHTML(`pages/${page}.html`);
    appContainer.innerHTML = `<div id="page-${page}" class="page active">${html}</div>`;
  }
  
  window.scrollTo(0, 0);
  
  // Re-attach event listeners for dynamic content if necessary
  attachDynamicListeners();
  lucide.createIcons();
}

async function showDashPage(sub) {
  const dashContent = document.getElementById('dashboard-content');
  if (!dashContent) return;

  const html = await loadHTML(`pages/dashboard/${sub}.html`);
  dashContent.innerHTML = `<div id="dash-${sub}" class="dash-page" style="display:block;">${html}</div>`;

  // Update sidebar active state
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  
  // Logic to highlight correct sidebar item
  let highlightId = sub;
  if (sub === 'cadastro-pet') highlightId = 'pets';
  
  const activeItem = document.querySelector(`.sidebar-item[data-page="${highlightId}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  } else if (highlightId === 'pets') { // Fallback for 'pets-cadastro'
      const fallbackItem = document.querySelector(`.sidebar-item[data-page="pets-cadastro"]`);
      if(fallbackItem) fallbackItem.classList.add('active');
  }

  dashContent.scrollTop = 0;
  
  attachDynamicListeners();
  lucide.createIcons();
}

// FEEDBACK SYSTEM
function showToast(title, message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? 'check-circle' : 'alert-circle';
  
  toast.innerHTML = `
    <div class="toast-icon"><i data-lucide="${icon}"></i></div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
  `;
  
  container.appendChild(toast);
  lucide.createIcons();
  
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function openModal(title, message, icon = 'check-circle-2') {
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-msg').innerText = message;
  document.getElementById('modal-icon-container').innerHTML = `<i data-lucide="${icon}" style="width:32px; height:32px;"></i>`;
  document.getElementById('global-modal-overlay').classList.add('active');
  lucide.createIcons();
}

function closeModal() {
  document.getElementById('global-modal-overlay').classList.remove('active');
}

// PET DETAILS LOGIC
const petData = {
  'luna': {
    name: 'Luna',
    species: 'Cão',
    sex: 'Fêmea',
    age: '2 anos',
    breed: 'Golden Retriever',
    size: 'Médio',
    temperament: 'Dócil e Brincalhona',
    health: 'Vacinada e Castrada',
    status: 'Disponível',
    history: 'Luna foi resgatada de uma situação de abandono em uma rodovia. Apesar do trauma, ela nunca perdeu sua doçura. É extremamente sociável com outros cães e adora crianças. Busca um lar com espaço para correr e receber muito carinho.',
    bannerColor: 'linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)',
    icon: 'dog'
  },
  'thor': {
    name: 'Thor',
    species: 'Gato',
    sex: 'Macho',
    age: '1 ano',
    breed: 'SRD',
    size: 'Pequeno',
    temperament: 'Calmo e Independente',
    health: 'Vacinado',
    status: 'Disponível',
    history: 'Thor foi encontrado ainda filhote em uma caixa de papelão. É um gatinho tranquilo que aprecia a companhia humana, mas também gosta do seu tempo sozinho. Adora observar o movimento pela janela e é muito limpo e educado.',
    bannerColor: 'linear-gradient(135deg, #A1C4FD 0%, #C2E9FB 100%)',
    icon: 'cat'
  },
  'mel': {
    name: 'Mel',
    species: 'Cão',
    sex: 'Fêmea',
    age: '4 anos',
    breed: 'Vira-lata',
    size: 'Pequeno',
    temperament: 'Carinhosa e Obediente',
    health: 'Vacinada e Vermifugada',
    status: 'Em processo',
    history: 'Mel vivia em uma casa onde seus donos se mudaram e a deixaram para trás. É uma cadelinha madura, já entende comandos básicos e é muito silenciosa. Perfeita para apartamentos ou casas com idosos, pois é muito cuidadosa.',
    bannerColor: 'linear-gradient(135deg, #F6D365 0%, #FDA085 100%)',
    icon: 'dog'
  }
};

function openPetDetails(id) {
  const pet = petData[id];
  if (!pet) return;

  const overlay = document.getElementById('pet-details-modal-overlay');
  const banner = document.getElementById('pet-details-banner');
  
  document.getElementById('pet-details-name').innerText = pet.name;
  document.getElementById('pet-details-subtitle').innerText = `${pet.species} • ${pet.age} • ${pet.sex}`;
  document.getElementById('pet-details-size').innerText = pet.size;
  document.getElementById('pet-details-temperament').innerText = pet.temperament;
  document.getElementById('pet-details-health').innerText = pet.health;
  document.getElementById('pet-details-history').innerText = pet.history;
  
  const statusPill = document.getElementById('pet-details-status');
  statusPill.innerText = pet.status;
  statusPill.className = `status-pill ${pet.status === 'Disponível' ? 'status-green' : 'status-blue'}`;

  banner.style.background = pet.bannerColor;
  banner.innerHTML = `<i data-lucide="${pet.icon}" style="width: 80px; height: 80px; color: white;"></i>`;
  
  overlay.classList.add('active');
  lucide.createIcons();
}

function closePetDetails() {
  document.getElementById('pet-details-modal-overlay').classList.remove('active');
}

function requestAdoptionFromDetails() {
  const petName = document.getElementById('pet-details-name').innerText;
  closePetDetails();
  openModal('Solicitação Enviada', `Seu interesse em adotar ${petName} foi registrado! Nossa equipe entrará em contato para agendar uma visita.`);
}

function doLogin() {
  showPage('dashboard');
  showToast('Bem-vindo!', 'Você entrou com sucesso no Programa ARCA.');
}

function logout() {
  showPage('landing');
  showToast('Até logo!', 'Sua sessão foi encerrada.');
}

function attachDynamicListeners() {
  // Botoes de acao nas paginas
  document.querySelectorAll('.btn-primary, .action-btn-blue').forEach(btn => {
    if (btn.onclick || btn.hasAttribute('data-has-listener')) return;
    
    // Simular feedbacks para demonstracao
    btn.addEventListener('click', function() {
      const text = this.innerText.toLowerCase();
      if (text.includes('cadastrar') || text.includes('salvar')) {
        openModal('Sucesso!', 'Os dados foram salvos e processados com êxito.');
      } else if (text.includes('adotar') || text.includes('solicitar') || text.includes('agendar')) {
        openModal('Solicitação Enviada', 'Recebemos seu pedido! Nossa equipe analisará e entrará em contato em breve.');
      }
    });
    btn.setAttribute('data-has-listener', 'true');
  });

  document.querySelectorAll('.date-btn').forEach(btn => {
    // Remove existing listener to prevent duplicates if re-attaching
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', function() {
      if(this.classList.contains('esgotado')) return;
      document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      showToast('Horário Selecionado', 'Clique em confirmar para agendar.');
    });
  });

  document.querySelectorAll('.severity-btn').forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', function() {
      this.closest('.severity-grid').querySelectorAll('.severity-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
    });
  });
}

// Initial load
window.addEventListener('DOMContentLoaded', () => {
  showPage('landing');
  lucide.createIcons();
});
