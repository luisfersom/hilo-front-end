# HILO · Entrega final de Front End

Plataforma académica de noticias de Luis Fernando Soto Marroquin. Implementada
con Angular 21, TypeScript, CSS y JSON local. Las noticias son ficticias.

## Ejecutar y verificar

Requiere Node.js 22.12 o posterior de la rama 22.

```bash
npm ci
npm start
```

Abrir http://localhost:4200. Para compilar y verificar la lógica:

```bash
npm test
npm run build
```

La compilación está en `dist/hilo/browser`. Para verificarla en Edge:

```bash
python3 -m http.server 8080 --directory dist/hilo/browser
# En otra terminal:
npm run test:browser
```

El test usa `/opt/microsoft/msedge/msedge`; se puede modificar con `BROWSER_PATH`.
Genera `tests/resultados-navegador.json` y capturas en `artifacts/capturas/`.

## Funciones y arquitectura

- Inicio: bienvenida, destacadas, sección informativa y enlaces de contacto.
- Kiosco: catálogo JSON, filtros y tarjetas reutilizables.
- Detalle: contenido, tiempo de lectura y notas relacionadas.
- Mi Hilo: favoritos que permanecen después de recargar.
- Redacción: crear y eliminar noticias con confirmación.
- Contacto: Reactive Forms con validación y confirmación simulada.

`src/app/app.routes.ts` define las seis vistas. `pages.component.ts` contiene
inicio, kiosco, favoritos y detalle; `forms.component.ts`, contacto y redacción.
`card.component.ts` recibe la noticia mediante `input`, interpola sus datos,
enlaza propiedades y responde a eventos `(click)`. `news.service.ts` mantiene
el estado reactivo mediante signals y utiliza la lógica probada de
`assets/js/store.js`. El CSS y las ilustraciones conservan la maquetación previa.

Los datos iniciales están en `data/noticias.json`; el catálogo modificado y los
favoritos usan la clave `hilo.estado.v1` de localStorage. El formato es compatible
con la segunda entrega. Los datos pertenecen al navegador y origen actuales;
no se comparten entre equipos ni pestañas en tiempo real. No hay servidor de
cuentas ni envío real de correos. Los fallos de almacenamiento muestran un aviso.

Para restablecer exclusivamente los datos de HILO, ejecutar en la consola:

```js
localStorage.removeItem('hilo.estado.v1');
location.reload();
```

## Despliegue

Repositorio: https://github.com/luisfersom/hilo-front-end

Aplicación publicada y verificada en Pages: https://luisfersom.github.io/hilo-front-end/

En GitHub, seleccionar Settings → Pages → Source → GitHub Actions. El workflow
`.github/workflows/pages.yml` compila, prueba y publica al actualizar `main`,
o mediante Run workflow. La URL anterior debe verificarse después de publicar;
la presencia del workflow por sí sola no significa que una actualización esté desplegada.
Las rutas con hash (`#/kiosco`) y la base relativa permiten recargar las vistas.

El informe APA y el guion de video se conservan fuera de este repositorio,
en la carpeta académica del proyecto. El video lo graba el autor y su enlace
se incorpora al informe final antes de la entrega.

## Referencias técnicas

- https://angular.dev/reference/versions
- https://angular.dev/guide/routing/define-routes
- https://angular.dev/api/router/withHashLocation
