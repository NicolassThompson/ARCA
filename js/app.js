const appContainer = document.getElementById('app-container');
let isDashboardShellLoaded = false;

// Cache for loaded pages
const pageCache = {};

// Navigation history for "Voltar" button
const navHistory = [];

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

  document.body.classList.toggle('page-landing', page === 'landing');

  // Update Nav
  document.getElementById('nav-links-public').style.display = isDash ? 'none' : 'flex';
  document.getElementById('nav-links-auth').style.display = isDash ? 'flex' : 'none';
  document.getElementById('nav-cta-btn').style.display = (isDash || page === 'login') ? 'none' : 'block';
  document.getElementById('nav-user-icons').style.display = isDash ? 'flex' : 'none';

  if (isDash) {
    if (!isDashboardShellLoaded) {
      const template = document.getElementById('dashboard-shell-template').innerHTML;
      appContainer.innerHTML = template;
      isDashboardShellLoaded = true;
    }
    await showDashPage('home');
  } else {
    isDashboardShellLoaded = false;
    const html = await loadHTML(`pages/${page}.html`);
    appContainer.innerHTML = `<div id="page-${page}" class="page active">${html}</div>`;
  }

  window.scrollTo(0, 0);
  attachDynamicListeners();
  lucide.createIcons();
}

// Track current dash page for back navigation
let currentDashPage = 'home';

async function showDashPage(sub) {
  const dashContent = document.getElementById('dashboard-content');
  if (!dashContent) return;

  // Push to history before switching
  if (currentDashPage && currentDashPage !== sub) {
    navHistory.push(currentDashPage);
    if (navHistory.length > 20) navHistory.shift(); // cap history
  }
  currentDashPage = sub;

  const html = await loadHTML(`pages/dashboard/${sub}.html`);
  dashContent.innerHTML = `<div id="dash-${sub}" class="dash-page" style="display:block;">${html}</div>`;

  // Update sidebar active state
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));

  let highlightId = sub;
  if (sub === 'cadastro-pet') highlightId = 'pets';
  if (sub === 'detalhe-pet') highlightId = 'pets';
  if (sub === 'detalhes-agendamento') highlightId = 'agenda';
  if (sub === 'agendamento-confirmado') highlightId = 'castracao';
  if (sub === 'confirmacao') highlightId = 'resgate';
  if (sub === 'acompanhamento') highlightId = 'resgate';
  if (sub === 'artigo') highlightId = 'edu';

  const activeItem = document.querySelector(`.sidebar-item[data-page="${highlightId}"]`);
  if (activeItem) activeItem.classList.add('active');

  dashContent.scrollTop = 0;
  attachDynamicListeners();
  lucide.createIcons();
}

// Navigate back in history
function navigateBack() {
  if (navHistory.length > 0) {
    const prev = navHistory.pop();
    currentDashPage = prev; // don't push to history when going back
    showDashPageDirect(prev);
  } else {
    showDashPageDirect('home');
  }
}

// showDashPage without pushing to history (used by navigateBack)
async function showDashPageDirect(sub) {
  const dashContent = document.getElementById('dashboard-content');
  if (!dashContent) return;

  currentDashPage = sub;
  const html = await loadHTML(`pages/dashboard/${sub}.html`);
  dashContent.innerHTML = `<div id="dash-${sub}" class="dash-page" style="display:block;">${html}</div>`;

  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  const activeItem = document.querySelector(`.sidebar-item[data-page="${sub}"]`);
  if (activeItem) activeItem.classList.add('active');

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

// PET DETAILS MODAL (adoção)
const petData = {
  'luna': {
    name: 'Luna', species: 'Cão', sex: 'Fêmea', age: '2 anos', breed: 'Golden Retriever',
    size: 'Médio', temperament: 'Dócil e Brincalhona', health: 'Vacinada e Castrada',
    status: 'Disponível',
    history: 'Luna foi resgatada de uma situação de abandono em uma rodovia. Apesar do trauma, ela nunca perdeu sua doçura. É extremamente sociável com outros cães e adora crianças.',
    bannerColor: 'linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)', icon: 'dog'
  },
  'thor': {
    name: 'Thor', species: 'Gato', sex: 'Macho', age: '1 ano', breed: 'SRD',
    size: 'Pequeno', temperament: 'Calmo e Independente', health: 'Vacinado',
    status: 'Disponível',
    history: 'Thor foi encontrado ainda filhote em uma caixa de papelão. É um gatinho tranquilo que aprecia a companhia humana, mas também gosta do seu tempo sozinho.',
    bannerColor: 'linear-gradient(135deg, #A1C4FD 0%, #C2E9FB 100%)', icon: 'cat'
  },
  'mel': {
    name: 'Mel', species: 'Cão', sex: 'Fêmea', age: '4 anos', breed: 'Vira-lata',
    size: 'Pequeno', temperament: 'Carinhosa e Obediente', health: 'Vacinada e Vermifugada',
    status: 'Em processo',
    history: 'Mel vivia em uma casa onde seus donos se mudaram e a deixaram para trás. É uma cadelinha madura, já entende comandos básicos e é muito silenciosa.',
    bannerColor: 'linear-gradient(135deg, #F6D365 0%, #FDA085 100%)', icon: 'dog'
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

// CPF LOGIC
function formatCPF(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

function isValidCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf == '') return false;
  
  if (cpf.length != 11 || 
    cpf == "00000000000" || 
    cpf == "11111111111" || 
    cpf == "22222222222" || 
    cpf == "33333333333" || 
    cpf == "44444444444" || 
    cpf == "55555555555" || 
    cpf == "66666666666" || 
    cpf == "77777777777" || 
    cpf == "88888888888" || 
    cpf == "99999999999")
      return false;
      
  let add = 0;
  for (let i = 0; i < 9; i ++)
    add += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (add % 11);
  if (rev == 10 || rev == 11) rev = 0;
  if (rev != parseInt(cpf.charAt(9))) return false;
  
  add = 0;
  for (let i = 0; i < 10; i ++)
    add += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (add % 11);
  if (rev == 10 || rev == 11) rev = 0;
  if (rev != parseInt(cpf.charAt(10))) return false;
  
  return true;
}

function validateCPFInput(inputEl) {
  const cpf = inputEl.value;
  if (!isValidCPF(cpf)) {
    inputEl.classList.add('error');
    return false;
  } else {
    inputEl.classList.remove('error');
    return true;
  }
}

function doLogin() {
  if (!validateRequiredFields('#page-login')) return;
  const cpfInput = document.getElementById('login-cpf');
  const senhaInput = document.getElementById('login-senha');
  const authError = document.getElementById('login-auth-error');

  if (cpfInput && !validateCPFInput(cpfInput)) {
    return;
  }
  
  if (window.ArcaStore) {
    const success = ArcaStore.loginUser(cpfInput.value, senhaInput.value);
    if (!success) {
      senhaInput.classList.add('error');
      cpfInput.classList.add('error');
      if (authError) authError.style.display = 'block';
      return;
    } else {
      senhaInput.classList.remove('error');
      cpfInput.classList.remove('error');
      if (authError) authError.style.display = 'none';
    }
  }

  showPage('dashboard');
  showToast('Bem-vindo!', 'Você entrou com sucesso no Programa ARCA.');
}

function continueCadastro() {
  if (!validateRequiredFields('#page-cadastro')) return;
  
  const cpfInput = document.getElementById('cadastro-cpf');
  const cpfError = document.getElementById('cadastro-cpf-error');
  
  if (cpfInput && !validateCPFInput(cpfInput)) {
    if (cpfError) {
      cpfError.innerText = 'CPF inválido';
      cpfError.style.display = '';
    }
    return;
  }

  if (window.ArcaStore) {
    const userData = {
      name: document.getElementById('cadastro-nome').value,
      cpf: cpfInput.value,
      phone: document.getElementById('cadastro-telefone').value,
      email: document.getElementById('cadastro-email').value,
      password: document.getElementById('cadastro-senha').value,
      neighborhood: document.getElementById('cadastro-bairro').value
    };
    
    const success = ArcaStore.registerUser(userData);
    if (!success) {
      cpfInput.classList.add('error');
      if (cpfError) {
        cpfError.innerText = 'CPF já cadastrado';
        cpfError.style.display = 'block';
      }
      return;
    } else {
      cpfInput.classList.remove('error');
      if (cpfError) cpfError.style.display = '';
    }
  }
  
  showPage('login');
  showToast('Conta criada!', 'Sua conta foi criada com sucesso. Faça login para continuar.');
}

function validateRequiredFields(containerSelector) {
  const inputs = document.querySelectorAll(`${containerSelector} [required]`);
  for (const input of inputs) {
    if (!input.checkValidity()) {
      input.reportValidity();
      return false;
    }
  }
  return true;
}

function logout() {
  navHistory.length = 0;
  currentDashPage = 'home';
  showPage('landing');
  showToast('Até logo!', 'Sua sessão foi encerrada.');
}

function attachDynamicListeners() {
  document.querySelectorAll('.btn-primary, .action-btn-blue').forEach(btn => {
    if (btn.onclick || btn.hasAttribute('data-has-listener')) return;

    btn.addEventListener('click', function() {
      const text = this.innerText.toLowerCase();
      if (text.includes('cadastrar') || text.includes('salvar')) {
        openModal('Sucesso!', 'Os dados foram salvos e processados com êxito.');
      } else if (text.includes('adotar') || text.includes('solicitar') || text.includes('agendar')) {
        openModal('Solicitação Enviada', 'Recebemos seu pedido! Nossa equipe analisará e entrará em contato em breve.');
      } else if (text.includes('confirmar')) {
        showDashPage('agendamento-confirmado');
      } else if (text.includes('enviar')) {
        showDashPage('confirmacao');
      }
    });
    btn.setAttribute('data-has-listener', 'true');
  });

  document.querySelectorAll('.date-btn').forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', function() {
      if (this.classList.contains('esgotado')) return;
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

  // Conectar botões "Ver cadastro" em pets.html → detalhe-pet
  document.querySelectorAll('.action-btn-blue').forEach(btn => {
    if (btn.getAttribute('data-has-listener')) return;
    if (btn.innerText.trim() === 'Ver cadastro') {
      btn.addEventListener('click', () => showDashPage('detalhe-pet'));
      btn.setAttribute('data-has-listener', 'true');
    }
  });

  // Conectar artigos em edu.html → artigo
  document.querySelectorAll('.article-card, .featured-card').forEach(card => {
    if (card.getAttribute('data-has-listener')) return;
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => showDashPage('artigo'));
    card.setAttribute('data-has-listener', 'true');
  });

  // Conectar agenda → detalhes-agendamento
  document.querySelectorAll('.notif-item').forEach(item => {
    if (item.getAttribute('data-has-listener')) return;
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => showDashPage('detalhes-agendamento'));
    item.setAttribute('data-has-listener', 'true');
  });

  // Attach CPF formatter to inputs
  document.querySelectorAll('input[placeholder="000.000.000-00"]').forEach(input => {
    if (input.getAttribute('data-cpf-listener')) return;
    input.addEventListener('input', (e) => {
      e.target.value = formatCPF(e.target.value);
      e.target.classList.remove('error'); // remove error class on typing
    });
    input.setAttribute('data-cpf-listener', 'true');
  });
}

// Initial load
window.addEventListener('DOMContentLoaded', () => {
  showPage('landing');
  lucide.createIcons();
});
