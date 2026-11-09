/*
 * Avisos do painel da Tayssa (05/11/2026): quando uma cliente marca um
 * horário, o servidor manda o aviso (Web Push) e este arquivo mostra a
 * notificação no celular dela. Tocar abre a agenda do painel. Sem `fetch`:
 * ele não mexe em nenhuma página, só cuida dos avisos.
 */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try {
    d = e.data ? e.data.json() : {};
  } catch {
    d = { corpo: e.data ? e.data.text() : "" };
  }
  e.waitUntil(
    self.registration.showNotification(d.titulo || "Tayssa Lash", {
      body: d.corpo || "",
      icon: "/tayssa/apple-icon",
      tag: d.tag,
      renotify: Boolean(d.tag),
      data: { url: d.url || "/tayssa/admin/agenda" },
    }),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const alvo = new URL((e.notification.data && e.notification.data.url) || "/tayssa/admin/agenda", self.location.origin).href;
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((janelas) => {
      // uma janela do painel já aberta (dentro do escopo deste arquivo): vem
      // para a frente e vai para a agenda; se não der, abre uma nova
      for (const j of janelas) {
        if (j.url.startsWith(self.registration.scope) && "focus" in j) {
          return j
            .focus()
            .then((f) => (f && "navigate" in f ? f.navigate(alvo) : f))
            .catch(() => self.clients.openWindow(alvo));
        }
      }
      return self.clients.openWindow(alvo);
    }),
  );
});
