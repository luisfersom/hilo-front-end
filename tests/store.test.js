import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createStore, KEY } from "../assets/js/store.js";
const seed = JSON.parse(
  readFileSync(new URL("../data/noticias.json", import.meta.url)),
);
function memory() {
  const data = new Map();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, v),
  };
}
test("guardar, recargar y quitar un favorito sin duplicados", () => {
  const db = memory();
  let s = createStore(seed, db);
  s.toggle("1");
  assert.deepEqual(createStore(seed, db).favoritos, ["1"]);
  s.toggle("1");
  assert.deepEqual(s.favoritos, []);
  s.toggle("inexistente");
  assert.deepEqual(s.favoritos, []);
});
test("crear y eliminar persiste y limpia favoritos", () => {
  const db = memory();
  let s = createStore(seed, db);
  s.add({ ...seed[0], id: "nueva" });
  s.toggle("nueva");
  s = createStore(seed, db);
  assert.equal(s.noticias[0].id, "nueva");
  s.remove("nueva");
  const reload = createStore(seed, db);
  assert.equal(reload.noticias.length, seed.length);
  assert.deepEqual(reload.favoritos, []);
});
test("un catálogo vacío sigue vacío tras recargar", () => {
  const db = memory();
  const s = createStore(seed, db);
  seed.forEach((n) => s.remove(n.id));
  assert.deepEqual(createStore(seed, db).noticias, []);
});
test("datos corruptos y almacenamiento bloqueado no impiden leer", () => {
  const db = memory();
  db.setItem(KEY, "{");
  let warnings = [];
  assert.equal(
    createStore(seed, db, (m) => warnings.push(m)).noticias.length,
    seed.length,
  );
  assert.equal(warnings.length, 1);
  const blocked = {
    getItem() {
      throw Error();
    },
    setItem() {
      throw Error();
    },
  };
  const s = createStore(seed, blocked, (m) => warnings.push(m));
  s.toggle("1");
  assert.deepEqual(s.favoritos, ["1"]);
  assert.equal(warnings.length, 3);
});
test("rechaza noticias inválidas y limpia favoritos huérfanos", () => {
  const db = memory();
  db.setItem(
    KEY,
    JSON.stringify({ noticias: seed, favoritos: ["1", "1", "no-existe"] }),
  );
  const s = createStore(seed, db);
  assert.deepEqual(s.favoritos, ["1"]);
  assert.throws(() => s.add({ id: "x" }));
  assert.throws(() => s.add(seed[0]));
});
