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
  marca: 'AgendBarber',                  // Texto do logo no menu superior
  logoHero: 'img/sua-logo.svg?v=2',         // Coloque o logo da barbearia em img/ e troque aqui
  corDestaque: '#3d7eff',               // Cor dos botões, preços e detalhes (formato #rrggbb)
  tituloPagina: 'Barbearia Premium | Agendamento Online',
  descricaoPagina: 'Agende seu horário online. Cortes modernos, barba e muito mais com os melhores profissionais.',
  textoCatalogo: 'Barbearia, massoterapia e estética em um só lugar. Confira tudo o que oferecemos.',

  // --- Agenda ---
  horarios: [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00', '20:00'
  ],
  antecedenciaMinimaHoras: 1,

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
    },
    {
      nome: 'Liberação Miofascial com Ventosa', icone: '💆', classe: 'massoterapia',
      servicos: [
        { valor: 'Lib. Miofacial c/ Ventosa (Costas)', nome: 'Lib. Miofacial c/ Ventosa (Costas)', titulo: 'Costas', icone: '💆', preco: 65, desc: 'Ventosaterapia nas costas' },
        { valor: 'Lib. Miofacial c/ Ventosa (Membro Individual)', nome: 'Lib. Miofacial c/ Ventosa (Membro Indiv.)', titulo: 'Ombro / Braço / Coxa / Perna', icone: '💆', preco: 40, desc: 'Membro individual' },
        { valor: 'Lib. Miofacial c/ Ventosa (Membro Bilateral)', nome: 'Lib. Miofacial c/ Ventosa (Membro Bilat.)', titulo: 'Ombro / Braço / Coxa / Perna', icone: '💆', preco: 70, desc: 'Bilateral (ambos os lados)' },
        { valor: 'Lib. Miofacial c/ Ventosa (Peitoral)', nome: 'Lib. Miofacial c/ Ventosa (Peitoral)', titulo: 'Peitoral', icone: '💆', preco: 45, desc: 'Ventosaterapia no peitoral' },
        { valor: 'Lib. Miofacial c/ Ventosa (Corpo Inteiro)', nome: 'Lib. Miofacial c/ Ventosa (Corpo Inteiro)', titulo: 'Corpo Inteiro', icone: '💆', preco: 150, desc: 'Sessão completa em todo o corpo', destaque: true }
      ]
    },
    {
      nome: 'Estética & Bem-Estar', icone: '🧖‍♂️', classe: 'estetica',
      servicos: [
        { valor: 'Massagem Relaxante', nome: 'Massagem Relaxante', icone: '🧖‍♂️', preco: 60, desc: 'Relaxamento muscular profundo' },
        { valor: 'Limpeza de Pele', nome: 'Limpeza de Pele', icone: '🧴', preco: 55, desc: 'Limpeza profunda e revitalização' },
        { valor: 'Drenagem Linfática', nome: 'Drenagem Linfática', icone: '🍃', preco: 60, desc: 'Redução de inchaço e desintoxicação' }
      ]
    }
  ]
};
