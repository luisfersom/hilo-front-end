// Un único estado conserva catálogo y favoritos para eliminar referencias juntas.
export const KEY = "hilo.estado.v1";
export function validNews(n) {
  return (
    n &&
    [
      "id",
      "titulo",
      "hilo",
      "categoria",
      "imagen",
      "resumen",
      "contenido",
      "fecha",
      "autor",
    ].every((k) => typeof n[k] === "string" && n[k].trim())
  );
}
export function createStore(seed, storage, warn = () => {}) {
  let state = { noticias: seed.map((n) => ({ ...n })), favoritos: [] };
  try {
    const raw = storage.getItem(KEY);
    if (raw !== null) {
      const saved = JSON.parse(raw);
      if (
        !Array.isArray(saved.noticias) ||
        !saved.noticias.every(validNews) ||
        new Set(saved.noticias.map((n) => n.id)).size !==
          saved.noticias.length ||
        !Array.isArray(saved.favoritos)
      )
        throw Error("Estado inválido");
      state = saved;
      state.favoritos = [...new Set(saved.favoritos)].filter((id) =>
        state.noticias.some((n) => n.id === id),
      );
    }
  } catch {
    warn(
      "No se pudo recuperar el guardado. Se usa el catálogo inicial; los cambios pueden ser temporales.",
    );
  }
  function persist() {
    try {
      storage.setItem(KEY, JSON.stringify(state));
    } catch {
      warn(
        "No se pudo guardar en este navegador. Los cambios de esta página son temporales y pueden perderse al navegar o recargar.",
      );
    }
  }
  return {
    get noticias() {
      return state.noticias.map((n) => ({ ...n }));
    },
    get favoritos() {
      return [...state.favoritos];
    },
    toggle(id) {
      if (!state.noticias.some((n) => n.id === id)) return;
      state.favoritos = state.favoritos.includes(id)
        ? state.favoritos.filter((x) => x !== id)
        : [...state.favoritos, id];
      persist();
    },
    add(n) {
      if (!validNews(n) || state.noticias.some((x) => x.id === n.id))
        throw Error("Noticia inválida");
      state.noticias.unshift({ ...n });
      persist();
    },
    remove(id) {
      state.noticias = state.noticias.filter((n) => n.id !== id);
      state.favoritos = state.favoritos.filter((x) => x !== id);
      persist();
    },
  };
}
