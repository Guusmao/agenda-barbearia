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

  const logo = document.getElementById('heroLogo');
  if (logo) {
    logo.src = cfg.logoHero;
    logo.alt = 'Logo ' + cfg.nome;
  }

  // --- Grades de seleção de serviço (agendamento e modal do admin) ---
  const itemSelecao = s => `
    <div class="service-item" data-value="${esc(s.valor)}">
      <span class="service-item-icon">${esc(s.icone)}</span>
      <span class="service-item-name">${esc(s.nome)}</span>
      <span class="service-item-price">${esc(formatPreco(s))}</span>
    </div>`;

  ['serviceSelection', 'modalServiceSelection'].forEach(id => {
    const grid = document.getElementById(id);
    if (grid) grid.innerHTML = todosServicos.map(itemSelecao).join('');
  });

  // --- Catálogo da página "Nossos Serviços" ---
  const catalogo = document.getElementById('catalogoServicos');
  if (catalogo) {
    catalogo.innerHTML = cfg.categorias.map(cat => `
      <div class="servicos-categoria animate-fade-up">
        <div class="categoria-header">
          <span class="categoria-icon">${esc(cat.icone)}</span>
          <h3>${esc(cat.nome)}</h3>
        </div>
        <div class="servicos-lista-grid">
          ${cat.servicos.map(s => `
            <div class="servico-card-catalogo ${esc(cat.classe)}${s.destaque ? ' destaque' : ''}">
              <span class="servico-card-icon">${esc(s.icone)}</span>
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
