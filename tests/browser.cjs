/* Ejecutar con Playwright instalado; ver README. Usa un perfil temporal aislado. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.BROWSER_PATH || "/opt/microsoft/msedge/msedge",
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const base = process.env.BASE_URL || "http://127.0.0.1:8080/";
  const out = path.resolve(
    __dirname,
    process.env.SCREENSHOT_DIR || "../artifacts/capturas",
  );
  fs.mkdirSync(out, { recursive: true });
  const results = [];
  async function go(url) {
    await page.goto(base + url);
    await page.waitForSelector("main h1");
  }
  async function shot(name) {
    await page.screenshot({
      path: path.join(out, name + ".png"),
      fullPage: true,
    });
  }
  await go("index.html");
  assert.equal(await page.locator(".card").count(), 3);
  await shot("inicio-real");
  await go("noticias.html");
  assert.equal(await page.locator(".card").count(), 6);
  await shot("kiosco-real");
  await page.getByRole("button", { name: "Tecnología", exact: true }).click();
  assert.equal(await page.locator(".card").count(), 2);
  results.push("Catálogo JSON y filtro: correcto");
  await go("detalle.html?id=1");
  await page.locator("[data-save]").click();
  await page.reload();
  await page.waitForSelector("[data-save]");
  assert.equal(
    await page.locator("[data-save]").getAttribute("aria-pressed"),
    "true",
  );
  await shot("detalle-real");
  await go("favoritos.html");
  assert.equal(await page.locator(".card").count(), 1);
  await shot("favoritos-real");
  await page.locator("[data-save]").click();
  await page
    .getByRole("heading", { name: "Todavía no guardas noticias." })
    .waitFor();
  results.push("Favoritos, recarga, retiro y estado vacío: correcto");
  await go("contacto.html");
  await page.getByRole("button", { name: "Enviar dato" }).click();
  assert.equal(await page.locator("[aria-invalid=true]").count(), 4);
  assert.equal(await page.locator(":focus").getAttribute("id"), "nombre");
  await page.locator("#nombre").fill("Prueba");
  await page.locator("#correo").fill("correo-invalido");
  await page.locator("#asunto").selectOption("Aporte");
  await page.locator("#mensaje").fill("Dato de prueba");
  await page.getByRole("button", { name: "Enviar dato" }).click();
  assert.equal(
    await page.locator("#correo").getAttribute("aria-invalid"),
    "true",
  );
  await shot("contacto-error");
  await page.locator("#correo").fill("prueba@example.com");
  await page.getByRole("button", { name: "Enviar dato" }).click();
  assert.match(
    await page.locator("#confirmation").textContent(),
    /Confirmación simulada/,
  );
  await shot("contacto-real");
  results.push("Campos obligatorios, correo inválido y confirmación: correcto");
  await go("redaccion.html");
  await shot("redaccion-real");
  await page.getByRole("button", { name: "Publicar nota" }).click();
  assert.equal(await page.locator("[aria-invalid=true]").count(), 6);
  for (const [k, v] of Object.entries({
    titulo: "Nota de prueba <script>alert(1)</script>",
    hilo: "Prueba",
    imagen: "javascript:alert(1)",
    resumen: "Resumen de prueba",
    contenido: "Contenido de prueba",
  }))
    await page.locator("#" + k).fill(v);
  await page.locator("#categoria").selectOption("Educación");
  await page.getByRole("button", { name: "Publicar nota" }).click();
  assert.equal(
    await page.locator("#imagen").getAttribute("aria-invalid"),
    "true",
  );
  await page.locator("#imagen").fill("assets/img/editorial-0.svg");
  await page.getByRole("button", { name: "Publicar nota" }).click();
  assert.equal(await page.locator(".published").count(), 7);
  await go("noticias.html");
  assert.equal(await page.locator(".card").count(), 7);
  assert.match(
    await page.locator(".card h3").first().textContent(),
    /<script>/,
  );
  await page.locator("[data-save]").first().click();
  await go("redaccion.html");
  await page.locator("[data-delete]").first().click();
  await page.locator("#cancel-delete").click();
  assert.equal(await page.locator(".published").count(), 7);
  await page.locator("[data-delete]").first().click();
  await page.locator("#confirm-delete").click();
  await page.reload();
  await page.waitForSelector(".published");
  assert.equal(await page.locator(".published").count(), 6);
  await go("favoritos.html");
  assert.equal(await page.locator(".card").count(), 0);
  results.push(
    "Crear, persistir, cancelar eliminación, eliminar y limpiar favorito: correcto",
  );
  results.push(
    "Texto HTML se muestra como texto y URL javascript rechazada: correcto",
  );
  await go("detalle.html?id=no-existe");
  assert.equal(await page.locator("h1").textContent(), "Noticia no encontrada");
  results.push("Detalle inexistente: correcto");
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of [
      "index.html",
      "noticias.html",
      "detalle.html?id=1",
      "favoritos.html",
      "contacto.html",
      "redaccion.html",
    ]) {
      await go(route);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} desborda a ${width}`,
      );
      if (width === 390 && ["index.html", "contacto.html"].includes(route))
        await shot(route.split(".")[0] + "-movil-real");
    }
  }
  results.push(
    "Seis páginas sin desbordamiento horizontal a 390, 768 y 1440 px: correcto",
  );
  await page.route("**/data/noticias.json", (r) => r.abort());
  await go("noticias.html");
  assert.equal(
    await page.locator("h1").textContent(),
    "No se pudo cargar el catálogo",
  );
  await page.unroute("**/data/noticias.json");
  await page.locator("#retry").click();
  await page.waitForSelector(".card");
  results.push("Fallo de carga y reintento: correcto");
  await page.evaluate(() => localStorage.setItem("hilo.estado.v1", "{"));
  await page.reload();
  await page.waitForSelector(".card");
  assert.equal(await page.locator("#storage-warning").isVisible(), true);
  results.push("Recuperación de almacenamiento corrupto: correcto");
  assert.deepEqual(errors, []);
  const report = {
    fecha: new Date().toISOString(),
    navegador: await browser.version(),
    resultados: results,
    erroresJavaScript: errors,
  };
  fs.writeFileSync(
    path.resolve(__dirname, "resultados-navegador.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
