# HILO · Segunda entrega de Front End

Prototipo de noticias en HTML, CSS y JavaScript, sin dependencias de ejecución.
Autor: Luis Fernando Soto Marroquin. Las noticias son ficticias.

## Ejecutar

Desde la raíz de este repositorio (la carpeta que contiene `index.html`):

```bash
python3 -m http.server 8080
```

Abre http://localhost:8080. También puedes abrir esta carpeta con Live Server.
Se necesita un servidor HTTP para cargar módulos y JSON; no abras el HTML por doble clic.

## Recorrido

- Inicio: bienvenida, tres destacadas, sección informativa y contacto.
- Kiosco: seis noticias iniciales, filtros por categoría y favoritos.
- Detalle: noticia por `id`, tiempo de lectura y notas de la misma historia.
- Mi Hilo: favoritos persistentes y estado vacío.
- Redacción: crear noticias y eliminarlas con confirmación.
- Contacto: campos obligatorios, correo válido y confirmación de envío simulado.

El JSON inicial está en `data/noticias.json`. El navegador guarda el catálogo modificado
junto con los favoritos en `hilo.estado.v1`. Los cambios no modifican el archivo JSON.
Para restaurar las noticias de ejemplo, ejecuta en la consola del navegador:

```js
localStorage.removeItem('hilo.estado.v1');
location.reload();
```

La persistencia corresponde al mismo navegador y origen. No hay cuentas, servidor
de datos ni envío de correo. Si el navegador bloquea el almacenamiento, se muestra
un aviso; los cambios en memoria pueden perderse al cambiar de página. Las pestañas
abiertas simultáneamente no sincronizan sus cambios en tiempo real.

## Archivos

- Seis HTML: estructura semántica, navegación y punto de entrada.
- `assets/css/styles.css`: diseño adaptable a móvil, tablet y escritorio.
- `assets/js/app.js`: renderizado, navegación por identificador y formularios.
- `assets/js/store.js`: validación del estado y persistencia.
- `assets/img/`: ilustraciones SVG locales.
- `tests/`: pruebas de almacenamiento y recorrido automatizado del navegador.

## Verificación

```bash
npm test
```

Para repetir las pruebas de interfaz, instala Playwright en una ubicación temporal,
inicia el servidor y especifica el navegador Chromium disponible:

```bash
npm install --prefix /tmp/hilo-browser playwright
PLAYWRIGHT_MODULE=/tmp/hilo-browser/node_modules/playwright \
BROWSER_PATH=/opt/microsoft/msedge/msedge node tests/browser.cjs
```

El script usa un perfil temporal, genera capturas en `artifacts/capturas/` y escribe
`tests/resultados-navegador.json`. Se comprobó Edge 153.0.4234.46 en Linux,
a 390, 768 y 1440 px. Puedes definir `SCREENSHOT_DIR` con una ruta absoluta
para guardar las capturas en otra carpeta. Chrome y Firefox quedan pendientes de verificación.

## Repositorio e informe

Repositorio: [https://github.com/luisfersom/hilo-front-end](https://github.com/luisfersom/hilo-front-end).

Este repositorio contiene el aplicativo. El informe PDF en normas APA se entrega
por separado en la plataforma académica e incluye la URL del repositorio,
las maquetas, las evidencias de pruebas y el código fuente.
