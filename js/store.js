const ArcaStore = (function() {
  const STORE_KEY = 'arca_data';

  // The base date for the application (10/06/2026)
  const BASE_DATE = '2026-06-10';

  const defaultData = {
    user: null, // No one logged in by default
    registeredUsers: [
      {
        name: 'João Silva',
        cpf: '123.456.789-00', // Mock initial CPF
        phone: '(27) 9 9999-9999',
        email: 'joao@email.com',
        neighborhood: 'Laranjeiras',
        password: '123'
      }
    ],
    pets: [
      {
        id: 'p1',
        name: 'Rex',
        species: 'Cão',
        sex: 'Macho',
        breed: 'Vira-lata',
        color: 'Caramelo',
        age: '3 anos',
        size: 'Médio',
        castrado: 'Sim',
        microchip: '985112300445678',
        dataCadastro: '2025-09-05',
        statusCastracao: 'Concluído',
        proximaVacina: '2026-07-20'
      },
      {
        id: 'p2',
        name: 'Mia',
        species: 'Gato',
        sex: 'Fêmea',
        breed: 'SRD',
        color: 'Branco e Preto',
        age: '1 ano',
        size: 'Pequeno',
        castrado: 'Não',
        microchip: null,
        dataCadastro: '2026-01-10',
        statusCastracao: 'Agendado',
        proximaVacina: '2026-10-15'
      }
    ],
    agendamentos: [
      {
        id: 'a1',
        protocolo: '#ARCA-2025-00842',
        petId: 'p2',
        servico: 'Castração',
        data: '2026-06-15',
        horario: '08h00',
        clinica: 'Clínica Laranjeiras',
        status: 'Agendado'
      },
      {
        id: 'a0',
        protocolo: '#ARCA-2025-00123',
        petId: 'p1',
        servico: 'Castração',
        data: '2025-05-10',
        horario: '10h00',
        clinica: 'Clínica Laranjeiras',
        status: 'Concluído'
      }
    ],
    ocorrencias: [],
    notificacoes: [
      {
        id: 'n1',
        title: 'Castração da Mia confirmada',
        sub: 'Agendada para 15/06 às 08h · Clínica Laranjeiras',
        icon: 'check',
        type: 'success',
        link: 'detalhes-agendamento'
      }
    ]
  };

  let store = null;

  function loadStore() {
    const data = localStorage.getItem(STORE_KEY);
    if (data) {
      try {
        store = JSON.parse(data);
      } catch (e) {
        console.error('Error parsing localStorage data, resetting to default.', e);
        store = JSON.parse(JSON.stringify(defaultData));
        saveStore();
      }
    } else {
      store = JSON.parse(JSON.stringify(defaultData));
      saveStore();
    }
  }

  function saveStore() {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }

  // Initialize
  loadStore();

  return {
    init: loadStore,
    reset: function() {
      localStorage.removeItem(STORE_KEY);
      loadStore();
    },
    getUser: function() { return store.user; },
    setUser: function(userData) {
      if (!store.user) store.user = {};
      store.user = { ...store.user, ...userData };
      saveStore();
    },
    registerUser: function(userData) {
      const existing = store.registeredUsers.find(u => u.cpf === userData.cpf);
      if (existing) return false; // CPF already registered
      store.registeredUsers.push(userData);
      saveStore();
      return true;
    },
    loginUser: function(cpf, password) {
      const user = store.registeredUsers.find(u => u.cpf === cpf && u.password === password);
      if (user) {
        store.user = { ...user };
        saveStore();
        return true;
      }
      return false;
    },
    logout: function() {
      store.user = null;
      saveStore();
    },
    getPets: function() { return store.pets; },
    getPetById: function(id) { return store.pets.find(p => p.id === id); },
    addPet: function(pet) {
      const newPet = { ...pet, id: 'p' + Date.now() };
      store.pets.push(newPet);
      saveStore();
      return newPet;
    },
    updatePet: function(id, data) {
      const index = store.pets.findIndex(p => p.id === id);
      if (index !== -1) {
        store.pets[index] = { ...store.pets[index], ...data };
        saveStore();
      }
    },
    getAgendamentos: function() { return store.agendamentos; },
    getAgendamentoById: function(id) { return store.agendamentos.find(a => a.id === id); },
    addAgendamento: function(agendamento) {
      const newAgendamento = { ...agendamento, id: 'a' + Date.now() };
      store.agendamentos.push(newAgendamento);
      saveStore();
      return newAgendamento;
    },
    getOcorrencias: function() { return store.ocorrencias; },
    addOcorrencia: function(ocorrencia) {
      const newOcorrencia = { ...ocorrencia, id: 'o' + Date.now() };
      store.ocorrencias.push(newOcorrencia);
      saveStore();
      return newOcorrencia;
    },
    getNotificacoes: function() { return store.notificacoes; },
    addNotificacao: function(notif) {
      store.notificacoes.unshift({ ...notif, id: 'n' + Date.now() });
      saveStore();
    },
    clearNotificacoes: function() {
      store.notificacoes = [];
      saveStore();
    }
  };
})();
