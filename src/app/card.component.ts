import { Component, input, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { News, NewsService, safeImage } from "./news.service";
@Component({
  selector: "app-card",
  imports: [RouterLink],
  template: ` <article class="card">
    <img
      [src]="image(news().imagen)"
      [alt]="'Ilustración de ' + news().categoria"
      loading="lazy"
      (error)="fallback($event)"
    />
    <p class="tag">Hilo / {{ news().hilo }}</p>
    <h3>{{ news().titulo }}</h3>
    <p class="muted">{{ news().resumen }}</p>
    <div class="actions">
      <a class="button" [routerLink]="['/detalle', news().id]">Leer la nota</a
      ><button
        class="secondary"
        [attr.data-save]="news().id"
        [attr.aria-pressed]="saved()"
        [attr.aria-label]="label() + ': ' + news().titulo"
        (click)="store.toggle(news().id)"
      >
        {{ label() }}
      </button>
    </div>
  </article>`,
})
export class CardComponent {
  news = input.required<News>();
  removable = input(false);
  store = inject(NewsService);
  image = safeImage;
  saved() {
    return this.store.favoritos().includes(this.news().id);
  }
  label() {
    return this.removable()
      ? "Quitar de Mi Hilo"
      : this.saved()
        ? "Guardada"
        : "Guardar";
  }
  fallback(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img.dataset["fallback"]) {
      img.dataset["fallback"] = "true";
      img.src = "assets/img/editorial-0.svg";
    }
  }
}
