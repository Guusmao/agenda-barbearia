/**
 * Router.js - Gerencia a navegação entre visualizações (views) no index.html
 */

(function() {
  'use strict';

  const views = {
    'inicio': 'view-home',
    'agendamento': 'view-home',
    'servicos': 'servicos',
    'meus-agendamentos': 'meus-agendamentos',
    'admin': 'admin'
  };

  function init() {
    window.addEventListener('hashchange', handleRouteChange);
    handleRouteChange(); // Carregar rota inicial
  }

  function handleRouteChange() {
    const hash = window.location.hash.replace('#', '') || 'inicio';
    const viewId = views[hash] || 'view-home';

    showView(viewId);

    // Se a rota for interna de uma view (como #servicos dentro da home)
    if (viewId === 'view-home' && (hash === 'agendamento')) {
      const target = document.getElementById(hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
    
    // Atualizar classe active no navbar (opcional)
    updateNavbarActive(hash);
  }

  function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
      view.style.display = 'none';
      view.classList.remove('active');
    });

    const activeView = document.getElementById(viewId);
    if (activeView) {
      activeView.style.display = 'block';
      activeView.classList.add('active');
    }
  }

  function updateNavbarActive(hash) {
    document.querySelectorAll('.navbar-links a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === '#' + hash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
