// ==========================================
// Configuração da barbearia
// ==========================================
// Este é o ÚNICO arquivo que você precisa editar para adaptar o app
// a uma nova barbearia: nome, logo, horários e serviços.
//
// Atenção: o campo "valor" de cada serviço é o que fica salvo no banco.
// Se já existem agendamentos com aquele serviço, não troque o "valor";
// mude só "nome", "titulo", "desc" ou "preco".

window.APP_CONFIG = {
  // --- Identidade ---
  nome: 'Sua Barbearia',                // Nome completo (Google Agenda, painel)
  nomeCurto: 'Sua Barbearia',           // Nome curto (rodapé e menu do admin)
  marca: 'Agendaí Barber',               // Texto do logo no menu superior
  logoHero: 'img/sua-logo.svg?v=2',         // Coloque o logo da barbearia em img/ e troque aqui
  corDestaque: '#3d7eff',               // Cor dos botões, preços e detalhes (formato #rrggbb)
  tituloPagina: 'Agendaí Barber | Agende seu horário',
  descricaoPagina: 'Agende seu horário online. Cortes modernos, barba e muito mais com os melhores profissionais.',
  textoCatalogo: 'Corte, barba e acabamento. Confira tudo o que oferecemos.',

  // --- Barbeiros ---
  // Com 2 ou mais, o cliente escolhe com quem cortar e cada um tem a própria agenda.
  // Com 1 ou nenhum, a escolha some e a agenda é única.
  barbeiros: [
    { nome: 'Barbeiro 1', desc: 'Degradê e navalhado' },
    { nome: 'Barbeiro 2', desc: 'Barba e corte clássico' }
  ],

  // --- Agenda ---
  horarios: [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00', '20:00'
  ],
  antecedenciaMinimaHoras: 1,

  // --- Lembrete no WhatsApp (botão 🔔 no painel) ---
  // {nome}, {servico}, {data}, {horario} e {barbearia} são trocados pelos dados do agendamento
  mensagemLembrete: 'Olá, {nome}! Passando para lembrar do seu horário na {barbearia}: {servico} em {data} às {horario}. Se não puder vir, é só responder esta mensagem para remarcar. Até lá!',

  // --- Serviços ---
  // nome:   como aparece na hora de agendar
  // titulo: como aparece na página "Nossos Serviços" (opcional, usa "nome" se faltar)
  // aPartirDe: true mostra "a partir de R$ X"
  categorias: [
    {
      nome: 'Barbearia', icone: '✂️', classe: '',
      servicos: [
        { valor: 'Corte de Cabelo', nome: 'Corte de Cabelo', icone: '✂️', preco: 35, desc: 'Corte moderno e personalizado' },
        { valor: 'Barba', nome: 'Barba', icone: '🪒', preco: 25, desc: 'Barba alinhada com navalha' },
        { valor: 'Sobrancelha', nome: 'Sobrancelha', icone: '👁️', preco: 10, desc: 'Design e acabamento' },
        { valor: 'Pezinho', nome: 'Pezinho', icone: '📏', preco: 10, desc: 'Acabamento na nuca' },
        { valor: 'Progressiva', nome: 'Progressiva', icone: '🔥', preco: 70, aPartirDe: true, desc: 'Alisamento e tratamento capilar' }
      ]
    },
    {
      nome: 'Combos Promocionais', icone: '🎁', classe: 'combo',
      servicos: [
        { valor: 'Combo: Cabelo + Barba', nome: 'Cabelo + Barba', icone: '✂️🧔‍♂️', preco: 50, desc: 'Combo completo' },
        { valor: 'Combo: Cabelo + Sobrancelha', nome: 'Cabelo + Sobrancelha', icone: '✂️👁️', preco: 40, desc: 'Corte + design' },
        { valor: 'Combo: Barba + Sobrancelha', nome: 'Barba + Sobrancelha', icone: '🧔‍♂️👁️', preco: 32, desc: 'Barba + design' },
        { valor: 'Combo: Barba + Pezinho', nome: 'Barba + Pezinho', icone: '🧔‍♂️📏', preco: 32, desc: 'Barba + acabamento' },
        { valor: 'Combo: Cabelo + Barba + Sobrancelha', nome: 'Cabelo + Barba + Sobrancelha', icone: '✂️🧔‍♂️👁️', preco: 50, desc: 'Combo premium completo' }
      ]
    }
  ]
};
