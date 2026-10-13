import { bootstrapApplication } from "@angular/platform-browser";
import {
  provideRouter,
  withHashLocation,
  withInMemoryScrolling,
} from "@angular/router";
import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";
// Las rutas con hash permiten recargar cualquier vista en alojamiento estático.
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withHashLocation(),
      withInMemoryScrolling({ scrollPositionRestoration: "top" }),
    ),
  ],
}).catch(console.error);
