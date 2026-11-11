import { Routes } from "@angular/router";
import { MessagesComponent } from "./messages.component";
import {
  HomeComponent,
  KioscoComponent,
  FavoritesComponent,
  DetailComponent,
} from "./pages.component";
import { ContactComponent, NewsroomComponent } from "./forms.component";
export const routes: Routes = [
  { path: "mensajes", component: MessagesComponent, title: "Mensajes · HILO" },
  { path: "", component: HomeComponent, title: "Inicio · HILO" },
  { path: "kiosco", component: KioscoComponent, title: "Kiosco · HILO" },
  { path: "detalle/:id", component: DetailComponent, title: "La nota · HILO" },
  { path: "mi-hilo", component: FavoritesComponent, title: "Mi Hilo · HILO" },
  {
    path: "redaccion",
    component: NewsroomComponent,
    title: "Redacción · HILO",
  },
  {
    path: "contacto",
    component: ContactComponent,
    title: "Envía un dato · HILO",
  },
  { path: "**", redirectTo: "" },
];
