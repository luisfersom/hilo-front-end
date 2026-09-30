import { createStore, validNews } from "./store.js";
const main = document.querySelector("main");
const page = document.body.dataset.page;
let store;
let category = "Todos";
// Los datos introducidos por el usuario se insertan como texto escapado.
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const href = (n) => `detalle.html?id=${encodeURIComponent(n.id)}`;
function safeImage(value) {
  try {
    const url = new URL(value, location.href);
    return ["http:", "https:"].includes(url.protocol)
      ? url.href
      : "assets/img/editorial-0.svg";
  } catch {
    return "assets/img/editorial-0.svg";
  }
}
function notify(message) {
  document.querySelector("#notice").textContent = message;
}
function saveButton(n, full = false) {
  const saved = store.favoritos.includes(n.id);
  const label =
    page === "favoritos"
      ? "Quitar de Mi Hilo"
      : saved
        ? "Guardada"
        : full
          ? "Guardar en Mi Hilo"
          : "Guardar";
  return `<button class="secondary" data-save="${esc(n.id)}" aria-pressed="${saved}" aria-label="${esc(label + ": " + n.titulo)}">${label}</button>`;
}
function card(n) {
  return `<article class="card"><img src="${esc(safeImage(n.imagen))}" alt="Ilustración de ${esc(n.categoria)}" loading="lazy"><p class="tag">Hilo / ${esc(n.hilo)}</p><h3>${esc(n.titulo)}</h3><p class="muted">${esc(n.resumen)}</p><div class="actions"><a class="button" href="${href(n)}">Leer la nota</a>${saveButton(n)}</div></article>`;
}
function cards(news, message = "No hay noticias en esta categoría.") {
  return news.length
    ? `<div class="grid">${news.map(card).join("")}</div>`
    : `<div class="empty"><h2>${message}</h2><a class="button" href="noticias.html">Entrar al Kiosco</a></div>`;
}
function field(name, label, type = "text", options = null) {
  const attrs = `id="${name}" name="${name}" required aria-describedby="${name}-error"`;
  const control = options
    ? `<select ${attrs}><option value="">Selecciona una opción</option>${options.map((x) => `<option>${esc(x)}</option>`).join("")}</select>`
    : type === "textarea"
      ? `<textarea ${attrs} maxlength="12000"></textarea>`
      : `<input ${attrs} type="${type}" maxlength="${name === "imagen" ? 2048 : 200}" ${name === "correo" ? 'autocomplete="email"' : name === "nombre" ? 'autocomplete="name"' : ""}>`;
  return `<label for="${name}">${label} *</label>${control}<p id="${name}-error" class="error"></p>`;
}
function contact() {
  return `<h1>Envía un dato</h1><p class="lead">¿Tienes una pista o una corrección? Cuéntanos.</p><div class="split"><form id="contact-form" novalidate>${field("nombre", "Nombre")}${field("correo", "Correo electrónico", "email")}${field("asunto", "Asunto", "text", ["Aporte", "Corrección"])}${field("mensaje", "Mensaje", "textarea")}<div class="form-actions"><button>Enviar dato</button></div><p class="muted">* Campos obligatorios. En este prototipo académico el envío es simulado.</p><p id="confirmation" role="status"></p></form><aside><h2>Antes de enviar</h2><p>Incluye una fuente consultable y evita datos personales de terceros.</p><p>Este formulario no envía correos ni transmite tus datos.</p></aside></div>`;
}
function newsroom() {
  return `<h1>Sala de redacción</h1><p class="lead">Crea una nota para el catálogo de demostración.</p><div class="split"><form id="news-form" novalidate>${field("titulo", "Título")}${field("hilo", "Hilo")}${field("categoria", "Categoría", "text", ["Educación", "Tecnología", "Cultura"])}${field("imagen", "Imagen (ruta local o URL http/https)")}<p class="muted">Puedes usar assets/img/editorial-0.svg</p>${field("resumen", "Resumen")}${field("contenido", "Contenido", "textarea")}<div class="form-actions"><button>Publicar nota</button></div><p class="muted">* Campos obligatorios. Las notas se guardan solo en este navegador.</p></form><aside><h2>Notas publicadas</h2><div id="published"></div></aside></div><dialog aria-labelledby="delete-title"><h2 id="delete-title">¿Eliminar esta nota?</h2><p id="delete-description"></p><p>También se retirará de Mi Hilo. Esta acción no se puede deshacer.</p><div class="actions"><button class="secondary" id="cancel-delete" autofocus>Cancelar</button><button id="confirm-delete">Eliminar nota</button></div></dialog>`;
}
function published() {
  document.querySelector("#published").innerHTML =
    store.noticias
      .map(
        (n) =>
          `<article class="published"><h3><a href="${href(n)}">${esc(n.titulo)}</a></h3><button data-delete="${esc(n.id)}">Eliminar nota</button></article>`,
      )
      .join("") || "<p>No hay notas publicadas. Crea la primera.</p>";
}
function render() {
  const news = store.noticias;
  document.querySelector("#saved-count").textContent = store.favoritos.length;
  if (page === "index")
    main.innerHTML = `<section class="hero"><p class="eyebrow">Periodismo para seguir el contexto</p><h1>Las historias no terminan cuando termina la noticia.</h1><p class="lead">Explora, guarda y vuelve a las noticias que te importan.</p><a class="button" href="noticias.html">Entrar al Kiosco</a></section><section aria-labelledby="featured"><h2 id="featured">Destacadas</h2>${cards(news.filter((n) => n.destacada).slice(0, 3))}</section><section class="info"><h2>Cómo verificamos</h2><p>Confirmamos el origen. Contrastamos fuentes. Corregimos cuando es necesario.</p><p>Este es el proceso editorial propuesto para HILO. Las noticias de este prototipo son ficticias.</p><a href="contacto.html">Envía una pista o una corrección</a></section>`;
  if (page === "noticias") {
    const categories = ["Todos", ...new Set(news.map((n) => n.categoria))];
    if (!categories.includes(category)) category = "Todos";
    const filtered = news.filter(
      (n) => category === "Todos" || n.categoria === category,
    );
    main.innerHTML = `<h1>El Kiosco</h1><p class="lead">Explora por tema y guarda tus lecturas.</p><div class="filters" role="group" aria-label="Filtrar por categoría">${categories.map((c) => `<button data-category="${esc(c)}" class="secondary" aria-pressed="${category === c}">${esc(c)}</button>`).join("")}</div><p>${filtered.length} noticias · ${esc(category)}</p>${cards(filtered)}`;
  }
  if (page === "favoritos")
    main.innerHTML = `<h1>Mi Hilo</h1><p class="lead">Tus noticias guardadas, reunidas en un solo lugar.</p><p>${store.favoritos.length} noticias guardadas</p>${cards(
      news.filter((n) => store.favoritos.includes(n.id)),
      "Todavía no guardas noticias.",
    )}`;
  if (page === "detalle") {
    const n = news.find(
      (n) => n.id === new URLSearchParams(location.search).get("id"),
    );
    main.innerHTML = n
      ? `<a href="noticias.html">‹ Volver al Kiosco</a><h1>${esc(n.titulo)}</h1><p class="tag">${esc(n.hilo)} / ${Math.max(1, Math.ceil(n.contenido.split(/\s+/).length / 200))} min de lectura</p><p class="muted">${esc(n.autor)} · ${esc(n.fecha)}</p><div class="split"><article><img class="article-image" src="${esc(safeImage(n.imagen))}" alt="Ilustración de ${esc(n.categoria)}"><div class="article-body">${esc(n.contenido)}</div></article><aside>${saveButton(n, true)}<h2>En esta historia</h2>${
          news
            .filter((x) => x.hilo === n.hilo && x.id !== n.id)
            .map((x) => `<p><a href="${href(x)}">${esc(x.titulo)}</a></p>`)
            .join("") || "<p>Aún no hay más notas de esta historia.</p>"
        }<a href="contacto.html">Enviar un dato</a></aside></div>`
      : '<h1>Noticia no encontrada</h1><p>La nota no existe o fue retirada.</p><a class="button" href="noticias.html">Volver al Kiosco</a>';
    document.title = n ? `${n.titulo} · HILO` : "Noticia no encontrada · HILO";
  }
  if (page === "contacto") main.innerHTML = contact();
  if (page === "redaccion") {
    main.innerHTML = newsroom();
    published();
  }
}
// Validación explícita: conserva los valores y lleva el foco al primer error.
function validate(form) {
  let first;
  for (const input of form.querySelectorAll("[required]")) {
    let error = input.value.trim() ? "" : "Completa este campo.";
    if (!error && input.type === "email" && input.validity.typeMismatch)
      error = "Escribe un correo válido.";
    if (!error && input.name === "imagen") {
      try {
        if (
          !["http:", "https:"].includes(
            new URL(input.value, location.href).protocol,
          )
        )
          error = "Usa una ruta local o una URL http/https.";
      } catch {
        error = "Escribe una ruta o URL válida.";
      }
    }
    input.setAttribute("aria-invalid", String(Boolean(error)));
    document.getElementById(`${input.id}-error`).textContent = error;
    if (error && !first) first = input;
  }
  first?.focus();
  return !first;
}
let pendingDelete;
main.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button || !store) return;
  if (button.hasAttribute("data-save")) {
    const id = button.dataset.save;
    store.toggle(id);
    render();
    notify(
      store.favoritos.includes(id)
        ? "Noticia guardada en Mi Hilo."
        : "Noticia retirada de Mi Hilo.",
    );
    (
      [...main.querySelectorAll("[data-save]")].find(
        (b) => b.dataset.save === id,
      ) ||
      main.querySelector("[data-save]") ||
      main
    ).focus();
  }
  if (button.hasAttribute("data-category")) {
    category = button.dataset.category;
    render();
    [...main.querySelectorAll("[data-category]")]
      .find((b) => b.dataset.category === category)
      ?.focus();
  }
  if (button.hasAttribute("data-delete")) {
    pendingDelete = button.dataset.delete;
    document.querySelector("#delete-description").textContent =
      store.noticias.find((n) => n.id === pendingDelete).titulo;
    document.querySelector("dialog").showModal();
  }
  if (button.id === "cancel-delete") document.querySelector("dialog").close();
  if (button.id === "confirm-delete") {
    store.remove(pendingDelete);
    document.querySelector("dialog").close();
    published();
    document.querySelector("#saved-count").textContent = store.favoritos.length;
    notify("Noticia eliminada del catálogo y de los favoritos.");
    (
      main.querySelector("[data-delete]") || document.querySelector("#titulo")
    ).focus();
  }
});
main.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  if (form.id === "contact-form")
    document.querySelector("#confirmation").textContent = "";
  if (!validate(form)) return;
  const data = Object.fromEntries(
    [...new FormData(form)].map(([k, v]) => [k, v.trim()]),
  );
  if (form.id === "contact-form") {
    document.querySelector("#confirmation").textContent =
      "Dato recibido. Confirmación simulada: no se ha enviado ningún correo ni almacenado tu mensaje.";
    form.reset();
  }
  if (form.id === "news-form") {
    store.add({
      ...data,
      id: crypto.randomUUID(),
      fecha: new Date().toISOString().slice(0, 10),
      autor: "Redacción HILO",
      destacada: false,
    });
    form.reset();
    published();
    notify("Nota publicada. Ya puedes consultarla en el Kiosco.");
    document.querySelector("#titulo").focus();
  }
});
// Si una imagen externa falla, se utiliza una ilustración local.
main.addEventListener(
  "error",
  (e) => {
    if (e.target.tagName === "IMG" && !e.target.dataset.fallback) {
      e.target.dataset.fallback = "true";
      e.target.src = "assets/img/editorial-0.svg";
    }
  },
  true,
);
async function init() {
  try {
    const response = await fetch("data/noticias.json");
    if (!response.ok) throw Error("No se pudo cargar el JSON");
    const seed = await response.json();
    if (!Array.isArray(seed) || !seed.every(validNews))
      throw Error("Catálogo inválido");
    const storage = {
      getItem: (k) => localStorage.getItem(k),
      setItem: (k, v) => localStorage.setItem(k, v),
    };
    store = createStore(seed, storage, (message) => {
      const warning = document.querySelector("#storage-warning");
      warning.hidden = false;
      warning.textContent = message;
    });
    render();
  } catch {
    main.innerHTML =
      '<h1>No se pudo cargar el catálogo</h1><p>Comprueba la conexión y vuelve a intentarlo.</p><button id="retry">Reintentar</button>';
    document.querySelector("#retry").addEventListener("click", init);
  }
}
init();
