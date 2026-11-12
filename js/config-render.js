// ==========================================
// Aplica o APP_CONFIG na página
// ==========================================
// Precisa rodar antes de agendamento.js e admin.js, porque eles
// procuram os .service-item já desenhados na tela.

(function () {
  'use strict';

  const cfg = window.APP_CONFIG;
  if (!cfg) return;

  const todosServicos = cfg.categorias.flatMap(c => c.servicos);

  // Tabela valor -> preço, usada no faturamento do painel
  cfg.precos = Object.fromEntries(todosServicos.map(s => [s.valor, s.preco]));

  function esc(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function formatPreco(s) {
    const valor = 'R$ ' + s.preco.toFixed(2).replace('.', ',');
    return s.aPartirDe ? 'a partir de ' + valor : valor;
  }

  // --- Cor de destaque ---
  // A partir de uma cor, gera a versão clara, a escura e a cor do texto por cima
  function aplicarCor(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return;
    const n = parseInt(m[1], 16);
    const rgb = [n >> 16, (n >> 8) & 255, n & 255];
    const mistura = (alvo, peso) => '#' + rgb
      .map(c => Math.round(c + (alvo - c) * peso).toString(16).padStart(2, '0'))
      .join('');
    const luminancia = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    const raiz = document.documentElement.style;
    raiz.setProperty('--accent', '#' + m[1]);
    raiz.setProperty('--accent-rgb', rgb.join(', '));
    raiz.setProperty('--accent-light', mistura(255, 0.25));
    raiz.setProperty('--accent-dark', mistura(0, 0.2));
    raiz.setProperty('--on-accent', luminancia > 0.6 ? '#0e1116' : '#ffffff');
  }
  aplicarCor(cfg.corDestaque);

  // --- Textos ---
  document.title = cfg.tituloPagina;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', cfg.descricaoPagina);

  document.querySelectorAll('[data-config]').forEach(el => {
    const chave = el.dataset.config;
    if (cfg[chave] !== undefined) el.textContent = cfg[chave];
  });

  // Logo no menu superior no lugar do texto
  if (cfg.logoMenu) {
    document.querySelectorAll('.navbar-brand').forEach(a => {
      a.classList.add('navbar-brand-logo');
      a.innerHTML = `<img src="${esc(cfg.logoMenu)}" alt="${esc(cfg.nome)}">`;
    });
  }

  const logo = document.getElementById('heroLogo');
  if (logo) {
    logo.src = cfg.logoHero;
    logo.alt = 'Logo ' + cfg.nome;
  }

  // --- Ícones de traço (estilo Lucide). Em config.js use o nome, ou junte com "+" para combos.
  //     Texto que não for um nome conhecido (ex.: um emoji) aparece como está.
  const ICONES = {
    tesoura: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88"/><path d="M14.47 14.48 20 20"/><path d="M8.12 8.12 12 12"/>',
    barba: '<path d="M7 13c1.5-2 3-2 5-.5 2-1.5 3.5-1.5 5 .5-1.5.5-3 .5-5-.5-2 1-3.5 1-5 .5z"/><path d="M4 8c0 7 3.5 13 8 13s8-6 8-13"/><path d="M4 8c1 3 2 4 3.5 5"/><path d="M20 8c-1 3-2 4-3.5 5"/>',
    olho: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    regua: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>',
    chama: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    presente: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>'
  };
  function icone(nome) {
    const partes = String(nome || '').split('+').map(p => p.trim()).filter(Boolean);
    if (!partes.length || !partes.every(p => ICONES[p])) return esc(nome);
    return '<span class="icones icones-' + partes.length + '">' + partes.map(p =>
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONES[p] + '</svg>'
    ).join('') + '</span>';
  }

  // --- Grades de seleção de serviço (agendamento e modal do admin) ---
  const itemSelecao = s => `
    <div class="service-item" data-value="${esc(s.valor)}">
      <span class="service-item-icon">${icone(s.icone)}</span>
      <span class="service-item-name">${esc(s.nome)}</span>
      <span class="service-item-price">${esc(formatPreco(s))}</span>
    </div>`;

  ['serviceSelection', 'modalServiceSelection'].forEach(id => {
    const grid = document.getElementById(id);
    if (grid) grid.innerHTML = todosServicos.map(itemSelecao).join('');
  });

  // --- Barbeiros ---
  cfg.barbeiros = cfg.barbeiros || [];
  cfg.temVariosBarbeiros = cfg.barbeiros.length >= 2;
  if (cfg.temVariosBarbeiros) {
    const grid = document.getElementById('barberSelection');
    if (grid) {
      grid.innerHTML = cfg.barbeiros.map(b => `
        <div class="service-item" data-value="${esc(b.nome)}">
          <span class="service-item-icon barber-avatar">${esc(b.nome.trim().charAt(0).toUpperCase())}</span>
          <span class="service-item-name">${esc(b.nome)}</span>
          ${b.desc ? `<span class="service-item-price barber-desc">${esc(b.desc)}</span>` : ''}
        </div>`).join('');
      document.getElementById('barbeiroGroup').hidden = false;
    }
    const sel = document.getElementById('modalBarbeiro');
    if (sel) {
      sel.innerHTML = '<option value="" disabled selected>Selecione</option>' +
        cfg.barbeiros.map(b => `<option value="${esc(b.nome)}">${esc(b.nome)}</option>`).join('');
      document.getElementById('modalBarbeiroGroup').hidden = false;
    }
  }

  // --- Catálogo da página "Nossos Serviços" ---
  const catalogo = document.getElementById('catalogoServicos');
  if (catalogo) {
    catalogo.innerHTML = cfg.categorias.map(cat => `
      <div class="servicos-categoria animate-fade-up">
        <div class="categoria-header">
          <span class="categoria-icon">${icone(cat.icone)}</span>
          <h3>${esc(cat.nome)}</h3>
        </div>
        <div class="servicos-lista-grid">
          ${cat.servicos.map(s => `
            <div class="servico-card-catalogo ${esc(cat.classe)}${s.destaque ? ' destaque' : ''}">
              <span class="servico-card-icon">${icone(s.icone)}</span>
              <div class="servico-card-info">
                <h4>${esc(s.titulo || s.nome)}</h4>
                <p class="servico-card-desc">${esc(s.desc || '')}</p>
              </div>
              <span class="servico-card-preco">${esc(formatPreco(s))}</span>
            </div>`).join('')}
        </div>
      </div>`).join('');
  }
})();
