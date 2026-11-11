// ==========================================
// Service Worker - Barbearia Premium
// Versão com suporte a Push Notifications
// ==========================================

const CACHE_NAME = 'barbearia-cache-v19';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './css/ui-components.css',
  './js/supabase.js',
  './js/auth.js',
  './js/auth-ui.js',
  './js/agendamento.js',
  './js/meus_agendamentos.js',
  './js/admin.js',
  './js/router.js',
  './js/ui-components.js',
  './js/push-notifications.js',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/agendbarber_icon.png'
];

// --- Install ---
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// --- Activate ---
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// --- Fetch (cache-first para arquivos locais) ---
self.addEventListener('fetch', event => {
  // Ignora requisições externas (Supabase, etc)
  if (event.request.url.startsWith('http') && !event.request.url.includes(location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// ==========================================
// PUSH NOTIFICATIONS
// ==========================================

/**
 * Evento 'push': disparado quando o servidor envia uma notificação.
 * O payload contém os dados do novo agendamento.
 */
self.addEventListener('push', event => {
  console.log('[SW] Push recebido!', event);

  let data = {
    title: '🆕 Novo Agendamento!',
    body: 'Um novo agendamento foi realizado.',
    icon: './img/icon-192.png',
    badge: './img/icon-192.png',
    tag: 'novo-agendamento',
    data: { url: './index.html#admin' }
  };

  // Tentar parsear o payload enviado pelo servidor
  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        icon: './img/icon-192.png',
        badge: './img/icon-192.png',
        tag: 'novo-agendamento',
        // Vibração no celular: padrão [vibra, pausa, vibra]
        vibrate: [200, 100, 200],
        // Dados extras para o click handler
        data: {
          url: payload.url || './index.html#admin',
          agendamento: payload.agendamento || null
        },
        // Ações rápidas (aparece nos botões da notificação no Android)
        actions: [
          { action: 'abrir', title: '📋 Ver Painel' },
          { action: 'fechar', title: '✕ Fechar' }
        ],
        requireInteraction: true // Notificação fica visível até o usuário interagir
      };
    } catch (e) {
      console.warn('[SW] Falha ao parsear payload:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, data)
  );
});

/**
 * Evento 'notificationclick': ação quando usuário clica na notificação.
 */
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notificação clicada:', event.action);
  event.notification.close();

  if (event.action === 'fechar') return;

  // Abrir ou focar a aba do painel admin
  const urlToOpen = event.notification.data?.url || './index.html#admin';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Se já há uma aba aberta do site, focar nela
      for (const client of windowClients) {
        if (client.url.includes(location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      // Caso contrário, abrir nova aba
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

/**
 * Evento 'pushsubscriptionchange': disparado quando o browser renova a subscription.
 * Reenvia a nova subscription ao servidor automaticamente.
 */
self.addEventListener('pushsubscriptionchange', event => {
  console.log('[SW] Subscription changed, resubscribing...');
  
  const VAPID_PUBLIC_KEY = 'BKBHeMc_FsgxG746L15O8QcJjRdd152lxiolvWhQLxl0T9C5tIyW0eozRxTUzcjT5fRHMpbJuYxGhtdlVeJ6pB0';
  
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    }).then(subscription => {
      // Enviar nova subscription ao Supabase via fetch
      const SUPABASE_URL = 'https://mkakccwunpkytkkkvebt.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rYWtjY3d1bnBreXRra2t2ZWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTU2NDQsImV4cCI6MjA4ODczMTY0NH0.cg4prSRWUa9vY9zKVq7VN0Yi0bqU_1RX5vHRm4tRFd8';
      
      const subData = subscription.toJSON();
      return fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          endpoint: subData.endpoint,
          p256dh: subData.keys.p256dh,
          auth: subData.keys.auth,
          admin_email: 'renanlimalirav@gmail.com',
          updated_at: new Date().toISOString()
        })
      });
    })
  );
});
