import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { NewsService } from "./news.service";
@Component({
  selector: "app-root",
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: "./app.component.html",
})
export class AppComponent {
  store = inject(NewsService);
  links = [
    { path: "/", label: "Inicio" },
    { path: "/kiosco", label: "Kiosco" },
    { path: "/mi-hilo", label: "Mi Hilo" },
    { path: "/redaccion", label: "Redacción" },
    { path: "/contacto", label: "Envía un dato" },
  ];
  skip(event: Event) {
    event.preventDefault();
    document.getElementById("main")?.focus();
  }
}
