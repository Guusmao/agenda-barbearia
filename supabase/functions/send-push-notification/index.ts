// ==========================================
// Supabase Edge Function: send-push-notification
// ==========================================
// Recebe um webhook do Supabase Database quando um novo agendamento é inserido.
// Busca as push subscriptions do admin no banco e envia a notificação via Web Push (VAPID).
//
// Deploy: supabase functions deploy send-push-notification
// ==========================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configurações VAPID
const VAPID_PUBLIC_KEY = 'BKBHeMc_FsgxG746L15O8QcJjRdd152lxiolvWhQLxl0T9C5tIyW0eozRxTUzcjT5fRHMpbJuYxGhtdlVeJ6pB0';
const VAPID_PRIVATE_KEY = '6yoC1c4c5vNfOWWrirhcKCYmSR6RDo-NZsUayEhDhVo';
const VAPID_SUBJECT = 'mailto:renanlimalirav@gmail.com';

// ==========================================
// Utilitários VAPID / Web Push (Deno-native)
// ==========================================

/** Converte base64url → ArrayBuffer */
function base64urlToBuffer(base64url) {
  const padding = '='.repeat((4 - base64url.length % 4) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/** Converte ArrayBuffer → base64url */
function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/** Gera JWT VAPID para autenticação */
async function generateVapidJWT(audience) {
  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600, // 12h
    sub: VAPID_SUBJECT
  };

  const enc = new TextEncoder();
  const headerB64 = bufferToBase64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = bufferToBase64url(enc.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  // Importar chave privada VAPID (P-256)
  const privKeyBytes = base64urlToBuffer(VAPID_PRIVATE_KEY);
  
  // Converter raw 32 bytes para JWK
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: bufferToBase64url(base64urlToBuffer(VAPID_PUBLIC_KEY).slice(1, 33)),
    y: bufferToBase64url(base64urlToBuffer(VAPID_PUBLIC_KEY).slice(33, 65)),
    d: VAPID_PRIVATE_KEY,
    key_ops: ['sign'],
    ext: true
  };

  const privKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privKey,
    enc.encode(signingInput)
  );

  return `${signingInput}.${bufferToBase64url(signature)}`;
}

/** Envia push para uma subscription específica */
async function sendWebPush(subscription, payload) {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const jwt = await generateVapidJWT(audience);
  const vapidKey = VAPID_PUBLIC_KEY;

  const body = JSON.stringify(payload);
  const enc = new TextEncoder();

  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `vapid t=${jwt},k=${vapidKey}`,
      'TTL': '86400',
    },
    body: enc.encode(body)
  });

  return {
    status: response.status,
    ok: response.ok,
    statusText: response.statusText
  };
}

// ==========================================
// Handler Principal
// ==========================================
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  try {
    const body = await req.json();
    console.log('[send-push] Payload recebido:', JSON.stringify(body));

    // Suporte a webhook do Supabase Database (type: INSERT) 
    // e chamada direta do admin.js
    let agendamento = null;

    if (body.type === 'INSERT' && body.record) {
      // Chamado via Database Webhook do Supabase
      agendamento = body.record;
    } else if (body.agendamento) {
      // Chamado diretamente pelo frontend
      agendamento = body.agendamento;
    } else {
      // Pode ser o próprio objeto do agendamento
      agendamento = body;
    }

    if (!agendamento || !agendamento.nome) {
      return new Response(JSON.stringify({ error: 'Dados de agendamento inválidos.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Formatar data BR
    function formatDateBR(dateStr) {
      if (!dateStr) return '-';
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    }

    const notifTitle = '🆕 Novo Agendamento!';
    const notifBody = `${agendamento.nome} agendou ${agendamento.servico} para ${formatDateBR(agendamento.data)} às ${agendamento.horario}`;

    // Inicializar Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'https://mkakccwunpkytkkkvebt.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar todas as subscriptions do admin
    const { data: subscriptions, error: fetchErr } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('admin_email', 'renanlimalirav@gmail.com');

    if (fetchErr) {
      console.error('[send-push] Erro ao buscar subscriptions:', fetchErr.message);
      return new Response(JSON.stringify({ error: 'Erro ao buscar subscriptions: ' + fetchErr.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[send-push] Nenhuma subscription encontrada para o admin.');
      return new Response(JSON.stringify({ message: 'Nenhuma subscription de admin encontrada.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`[send-push] Enviando push para ${subscriptions.length} dispositivo(s)...`);

    // Payload da notificação
    const pushPayload = {
      title: notifTitle,
      body: notifBody,
      url: './index.html#admin',
      agendamento: {
        nome: agendamento.nome,
        servico: agendamento.servico,
        data: agendamento.data,
        horario: agendamento.horario
      }
    };

    // Enviar para cada subscription
    const results = await Promise.allSettled(
      subscriptions.map(sub => sendWebPush(sub, pushPayload))
    );

    const report = results.map((r, i) => ({
      endpoint: subscriptions[i].endpoint.substring(0, 60) + '...',
      status: r.status,
      value: r.value ?? null,
      reason: r.reason?.message ?? null
    }));

    console.log('[send-push] Resultados:', JSON.stringify(report));

    // Limpar subscriptions inválidas (410 = expirada)
    const toRemove = [];
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && (r.value.status === 410 || r.value.status === 404)) {
        toRemove.push(subscriptions[i].endpoint);
      }
    });

    if (toRemove.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', toRemove);
      console.log(`[send-push] Removidas ${toRemove.length} subscription(s) expirada(s).`);
    }

    return new Response(JSON.stringify({ success: true, sent: subscriptions.length, report }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (err) {
    console.error('[send-push] Erro geral:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
