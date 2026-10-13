import { Injectable, signal } from "@angular/core";
import { createStore, validNews } from "../../assets/js/store.js";
export interface News {
  id: string;
  titulo: string;
  hilo: string;
  categoria: string;
  imagen: string;
  resumen: string;
  contenido: string;
  fecha: string;
  autor: string;
  destacada?: boolean;
}
// Adaptador Angular: conserva el formato de almacenamiento de la segunda entrega.
@Injectable({ providedIn: "root" })
export class NewsService {
  noticias = signal<News[]>([]);
  favoritos = signal<string[]>([]);
  loading = signal(true);
  error = signal(false);
  warning = signal("");
  notice = signal("");
  private store!: ReturnType<typeof createStore>;
  constructor() {
    void this.load();
  }
  async load() {
    this.loading.set(true);
    this.error.set(false);
    try {
      const response = await fetch("data/noticias.json");
      if (!response.ok) throw Error("JSON no disponible");
      const seed = await response.json();
      if (!Array.isArray(seed) || !seed.every(validNews))
        throw Error("JSON inválido");
      this.store = createStore(
        seed,
        {
          getItem: (k: string) => localStorage.getItem(k),
          setItem: (k: string, v: string) => localStorage.setItem(k, v),
        },
        (m: string) => this.warning.set(m),
      );
      this.sync();
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
  private sync() {
    this.noticias.set(this.store.noticias);
    this.favoritos.set(this.store.favoritos);
  }
  toggle(id: string) {
    this.store.toggle(id);
    this.sync();
    this.notice.set(
      this.favoritos().includes(id)
        ? "Noticia guardada en Mi Hilo."
        : "Noticia retirada de Mi Hilo.",
    );
  }
  add(news: News) {
    this.store.add(news);
    this.sync();
    this.notice.set("Nota publicada. Ya puedes consultarla en el Kiosco.");
  }
  remove(id: string) {
    this.store.remove(id);
    this.sync();
    this.notice.set("Noticia eliminada del catálogo y de los favoritos.");
  }
}
export function safeImage(value: string): string {
  try {
    const url = new URL(value, document.baseURI);
    if (["http:", "https:"].includes(url.protocol)) return url.href;
  } catch {}
  return "assets/img/editorial-0.svg";
}
