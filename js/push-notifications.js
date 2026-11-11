// ==========================================
// Push Notifications - Admin (VAPID / Web Push)
// ==========================================
// Responsável por:
//  1. Solicitar permissão de notificação push ao navegador
//  2. Inscrever o navegador do admin no serviço de push
//  3. Salvar a subscription no Supabase (tabela push_subscriptions)
//  4. Expor window.PushAdmin para uso no admin.js

(function () {
  'use strict';

  // Chave pública VAPID (gerada com Python/cryptography - curva P-256)
  const VAPID_PUBLIC_KEY = 'BKBHeMc_FsgxG746L15O8QcJjRdd152lxiolvWhQLxl0T9C5tIyW0eozRxTUzcjT5fRHMpbJuYxGhtdlVeJ6pB0';

  // Email do admin para identificar a subscription
  const ADMIN_EMAIL = 'renanlimalirav@gmail.com';

  /**
   * Converte uma string base64url para Uint8Array
   * Necessário para passar a chave pública VAPID ao browser
   */
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Inicializa o sistema de push para o admin.
   * Deve ser chamado após o login do admin no painel.
   */
  async function initAdminPush() {
    // Verificar suporte
    if (!('serviceWorker' in navigator)) {
      console.warn('[Push] Service Worker não suportado neste navegador.');
      return;
    }
    if (!('PushManager' in window)) {
      console.warn('[Push] Web Push não suportado neste navegador.');
      return;
    }

    try {
      // Aguardar registro do SW
      const reg = await navigator.serviceWorker.ready;
      console.log('[Push] Service Worker pronto:', reg);

      // Verificar permissão atual
      const perm = await Notification.requestPermission();
      console.log('[Push] Permissão de notificação:', perm);

      if (perm !== 'granted') {
        console.warn('[Push] Permissão negada. Notificações push não serão enviadas.');
        return;
      }

      // Verificar se já existe uma subscription ativa
      let subscription = await reg.pushManager.getSubscription();

      if (!subscription) {
        console.log('[Push] Criando nova subscription...');
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
        console.log('[Push] Subscription criada:', subscription);
      } else {
        console.log('[Push] Subscription já existe:', subscription.endpoint);
      }

      // Salvar subscription no Supabase
      await saveSubscription(subscription);

    } catch (err) {
      console.error('[Push] Erro ao inicializar push:', err);
    }
  }

  /**
   * Salva (ou atualiza) a subscription push no Supabase.
   * Usa upsert baseado no endpoint para evitar duplicatas.
   */
  async function saveSubscription(subscription) {
    if (!window.supabaseClient) {
      console.error('[Push] supabaseClient não encontrado.');
      return;
    }

    const subData = subscription.toJSON();

    const record = {
      endpoint: subData.endpoint,
      p256dh: subData.keys.p256dh,
      auth: subData.keys.auth,
      admin_email: ADMIN_EMAIL,
      user_agent: navigator.userAgent.substring(0, 200),
      updated_at: new Date().toISOString()
    };

    try {
      const { error } = await window.supabaseClient
        .from('push_subscriptions')
        .upsert([record], { onConflict: 'endpoint' });

      if (error) {
        console.error('[Push] Erro ao salvar subscription:', error.message);
      } else {
        console.log('%c[Push] ✅ Subscription salva no Supabase!', 'color: #0f0; font-weight: bold;');
      }
    } catch (err) {
      console.error('[Push] Erro de conexão ao salvar subscription:', err);
    }
  }

  /**
   * Remove a subscription atual (usado no logout do admin)
   */
  async function unsubscribeAdmin() {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        // Remover do banco
        if (window.supabaseClient) {
          await window.supabaseClient
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', endpoint);
        }
        console.log('[Push] Subscription removida.');
      }
    } catch (err) {
      console.error('[Push] Erro ao cancelar subscription:', err);
    }
  }

  // Expor API pública
  window.PushAdmin = {
    init: initAdminPush,
    unsubscribe: unsubscribeAdmin,
    VAPID_PUBLIC_KEY
  };

  console.log('[Push] Módulo de Push Notifications carregado. VAPID Public Key configurada.');
})();
