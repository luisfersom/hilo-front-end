import { Component, inject, signal, computed } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { CardComponent } from "./card.component";
import { NewsService, safeImage } from "./news.service";
@Component({
  selector: "app-home",
  imports: [RouterLink, CardComponent],
  template: ` <section class="hero">
      <p class="eyebrow">Periodismo para seguir el contexto</p>
      <h1>Las historias no terminan cuando termina la noticia.</h1>
      <p class="lead">
        Explora, guarda y vuelve a las noticias que te importan.
      </p>
      <a class="button" routerLink="/kiosco">Entrar al Kiosco</a>
    </section>
    <section>
      <h2>Destacadas</h2>
      <div class="grid">
        @for (n of featured(); track n.id) {
          <app-card [news]="n" />
        }
      </div>
    </section>
    <section class="info">
      <h2>Cómo verificamos</h2>
      <p>
        Confirmamos el origen. Contrastamos fuentes. Corregimos cuando es
        necesario.
      </p>
      <p>
        Este es el proceso editorial propuesto para HILO. Las noticias son
        ficticias.
      </p>
      <a routerLink="/contacto">Envía una pista o una corrección</a>
    </section>`,
})
export class HomeComponent {
  store = inject(NewsService);
  featured = computed(() =>
    this.store
      .noticias()
      .filter((n) => n.destacada)
      .slice(0, 3),
  );
}
@Component({
  selector: "app-kiosco",
  imports: [CardComponent],
  template: `<h1>El Kiosco</h1>
    <p class="lead">Explora por tema y guarda tus lecturas.</p>
    <div class="filters" role="group" aria-label="Filtrar por categoría">
      @for (c of categories(); track c) {
        <button
          class="secondary"
          [attr.aria-pressed]="category() === c"
          (click)="category.set(c)"
        >
          {{ c }}
        </button>
      }
    </div>
    <p>{{ filtered().length }} noticias · {{ category() }}</p>
    <div class="grid">
      @for (n of filtered(); track n.id) {
        <app-card [news]="n" />
      } @empty {
        <p>No hay noticias en esta categoría.</p>
      }
    </div>`,
})
export class KioscoComponent {
  store = inject(NewsService);
  category = signal("Todos");
  categories = computed(() => [
    "Todos",
    ...new Set(this.store.noticias().map((n) => n.categoria)),
  ]);
  filtered = computed(() =>
    this.store
      .noticias()
      .filter(
        (n) => this.category() === "Todos" || n.categoria === this.category(),
      ),
  );
}
@Component({
  selector: "app-favorites",
  imports: [CardComponent, RouterLink],
  template: `<h1>Mi Hilo</h1>
    <p class="lead">Tus noticias guardadas, reunidas en un solo lugar.</p>
    <p>{{ news().length }} noticias guardadas</p>
    <div class="grid">
      @for (n of news(); track n.id) {
        <app-card [news]="n" [removable]="true" />
      } @empty {
        <div class="empty">
          <h2>Todavía no guardas noticias.</h2>
          <a class="button" routerLink="/kiosco">Entrar al Kiosco</a>
        </div>
      }
    </div>`,
})
export class FavoritesComponent {
  store = inject(NewsService);
  news = computed(() =>
    this.store.noticias().filter((n) => this.store.favoritos().includes(n.id)),
  );
}
@Component({
  selector: "app-detail",
  imports: [RouterLink],
  template: `@if (news(); as n) {
      <a routerLink="/kiosco">‹ Volver al Kiosco</a>
      <h1>{{ n.titulo }}</h1>
      <p class="tag">
        {{ n.hilo }} / {{ minutes(n.contenido) }} min de lectura
      </p>
      <p class="muted">{{ n.autor }} · {{ n.fecha }}</p>
      <div class="split">
        <article>
          <img
            class="article-image"
            [src]="image(n.imagen)"
            [alt]="'Ilustración de ' + n.categoria"
            (error)="fallback($event)"
          />
          <div class="article-body">{{ n.contenido }}</div>
        </article>
        <aside>
          <button
            class="secondary"
            [attr.data-save]="n.id"
            [attr.aria-pressed]="store.favoritos().includes(n.id)"
            (click)="store.toggle(n.id)"
          >
            {{
              store.favoritos().includes(n.id)
                ? "Guardada"
                : "Guardar en Mi Hilo"
            }}
          </button>
          <h2>En esta historia</h2>
          @for (other of related(); track other.id) {
            <p>
              <a [routerLink]="['/detalle', other.id]">{{ other.titulo }}</a>
            </p>
          } @empty {
            <p>Aún no hay más notas de esta historia.</p>
          }
          <a routerLink="/contacto">Enviar un dato</a>
        </aside>
      </div>
    } @else {
      <h1>Noticia no encontrada</h1>
      <p>La nota no existe o fue retirada.</p>
      <a class="button" routerLink="/kiosco">Volver al Kiosco</a>
    }`,
})
export class DetailComponent {
  store = inject(NewsService);
  params = toSignal(inject(ActivatedRoute).paramMap);
  news = computed(() =>
    this.store.noticias().find((n) => n.id === this.params()?.get("id")),
  );
  related = computed(() =>
    this.store
      .noticias()
      .filter((n) => n.hilo === this.news()?.hilo && n.id !== this.news()?.id),
  );
  image = safeImage;
  minutes(s: string) {
    return Math.max(1, Math.ceil(s.split(/\s+/).length / 200));
  }
  fallback(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img.dataset["fallback"]) {
      img.dataset["fallback"] = "true";
      img.src = "assets/img/editorial-0.svg";
    }
  }
}
