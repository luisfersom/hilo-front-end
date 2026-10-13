import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { RouterLink } from "@angular/router";
import { NewsService } from "./news.service";
const required = (c: AbstractControl) =>
  typeof c.value === "string" && c.value.trim() ? null : { required: true };
const imageUrl = (c: AbstractControl) => {
  try {
    return ["http:", "https:"].includes(
      new URL(c.value, document.baseURI).protocol,
    )
      ? null
      : { url: true };
  } catch {
    return { url: true };
  }
};
interface Field {
  name: string;
  label: string;
  type?: string;
  options?: string[];
}
const contactFields: Field[] = [
  { name: "nombre", label: "Nombre" },
  { name: "correo", label: "Correo electrónico", type: "email" },
  { name: "asunto", label: "Asunto", options: ["Aporte", "Corrección"] },
  { name: "mensaje", label: "Mensaje", type: "textarea" },
];
const newsFields: Field[] = [
  { name: "titulo", label: "Título" },
  { name: "hilo", label: "Hilo" },
  {
    name: "categoria",
    label: "Categoría",
    options: ["Educación", "Tecnología", "Cultura"],
  },
  { name: "imagen", label: "Imagen (ruta local o URL http/https)" },
  { name: "resumen", label: "Resumen" },
  { name: "contenido", label: "Contenido", type: "textarea" },
];
function makeForm(fields: Field[]) {
  return new FormGroup(
    Object.fromEntries(
      fields.map((f) => [
        f.name,
        new FormControl("", {
          nonNullable: true,
          validators: [
            required,
            Validators.maxLength(f.type === "textarea" ? 12000 : 2048),
            ...(f.type === "email" ? [Validators.email] : []),
            ...(f.name === "imagen" ? [imageUrl] : []),
          ],
        }),
      ]),
    ),
  );
}
const fieldsTemplate = `@for(f of fields;track f.name){<label [for]="f.name">{{f.label}} *</label>
@if(f.options){<select [id]="f.name" [formControlName]="f.name" required [attr.aria-invalid]="invalid(f.name)" [attr.aria-describedby]="f.name+'-error'"><option value="">Selecciona una opción</option>@for(o of f.options;track o){<option [value]="o">{{o}}</option>}</select>}
@else if(f.type==='textarea'){<textarea [id]="f.name" [formControlName]="f.name" required maxlength="12000" [attr.aria-invalid]="invalid(f.name)" [attr.aria-describedby]="f.name+'-error'"></textarea>}
@else{<input [id]="f.name" [type]="f.type||'text'" [formControlName]="f.name" required maxlength="2048" [attr.aria-invalid]="invalid(f.name)" [attr.aria-describedby]="f.name+'-error'">}
<p class="error" [id]="f.name+'-error'">{{invalid(f.name)?error(f.name):''}}</p>}`;
class FormPage {
  fields: Field[] = [];
  form!: ReturnType<typeof makeForm>;
  invalid(name: string) {
    const c = this.form.controls[name];
    return c.touched && c.invalid;
  }
  error(name: string) {
    const e = this.form.controls[name].errors;
    return e?.["required"]
      ? "Completa este campo."
      : e?.["email"]
        ? "Escribe un correo válido."
        : e?.["url"]
          ? "Usa una ruta local o una URL http/https."
          : "El texto supera la longitud permitida.";
  }
  validate() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      document
        .getElementById(
          this.fields.find((f) => this.form.controls[f.name].invalid)!.name,
        )
        ?.focus();
      return false;
    }
    return true;
  }
}
@Component({
  selector: "app-contact",
  imports: [ReactiveFormsModule],
  template:
    `<h1>Envía un dato</h1><p class="lead">¿Tienes una pista o una corrección? Cuéntanos.</p><div class="split"><form id="contact-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>` +
    fieldsTemplate +
    `<button>Enviar dato</button><p class="muted">* Campos obligatorios. En este proyecto académico el envío es simulado.</p><p id="confirmation" role="status">{{confirmation()}}</p></form><aside><h2>Antes de enviar</h2><p>Incluye una fuente consultable y evita datos personales de terceros.</p><p>Este formulario no envía correos ni transmite tus datos.</p></aside></div>`,
})
export class ContactComponent extends FormPage {
  override fields = contactFields;
  override form = makeForm(this.fields);
  confirmation = signal("");
  submit() {
    this.confirmation.set("");
    if (!this.validate()) return;
    this.confirmation.set(
      "Dato recibido. Confirmación simulada: no se ha enviado ningún correo ni almacenado tu mensaje.",
    );
    this.form.reset();
  }
}
@Component({
  selector: "app-newsroom",
  imports: [ReactiveFormsModule, RouterLink],
  template:
    `<h1>Sala de redacción</h1><p class="lead">Crea una nota para el catálogo de demostración.</p><div class="split"><form id="news-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>` +
    fieldsTemplate +
    `<p class="muted">Imagen de ejemplo: assets/img/editorial-0.svg</p><button>Publicar nota</button><p class="muted">* Campos obligatorios. Las notas se guardan solo en este navegador.</p></form><aside><h2>Notas publicadas</h2><div id="published">@for(n of store.noticias();track n.id){<article class="published"><h3><a [routerLink]="['/detalle',n.id]">{{n.titulo}}</a></h3><button [attr.data-delete]="n.id" (click)="pending=n.id;pendingTitle=n.titulo;dialog.showModal()">Eliminar nota</button></article>}@empty{<p>No hay notas publicadas. Crea la primera.</p>}</div></aside></div><dialog #dialog aria-labelledby="delete-title"><h2 id="delete-title">¿Eliminar esta nota?</h2><p>{{pendingTitle}}</p><p>También se retirará de Mi Hilo. Esta acción no se puede deshacer.</p><div class="actions"><button class="secondary" id="cancel-delete" autofocus (click)="dialog.close()">Cancelar</button><button id="confirm-delete" (click)="remove();dialog.close()">Eliminar nota</button></div></dialog>`,
})
export class NewsroomComponent extends FormPage {
  override fields = newsFields;
  override form = makeForm(this.fields);
  store = inject(NewsService);
  pending = "";
  pendingTitle = "";
  submit() {
    if (!this.validate()) return;
    const v = this.form.getRawValue();
    this.store.add({
      id: crypto.randomUUID(),
      titulo: v["titulo"].trim(),
      hilo: v["hilo"].trim(),
      categoria: v["categoria"],
      imagen: v["imagen"].trim(),
      resumen: v["resumen"].trim(),
      contenido: v["contenido"].trim(),
      fecha: new Date().toISOString().slice(0, 10),
      autor: "Redacción HILO",
      destacada: false,
    });
    this.form.reset();
    document.getElementById("titulo")?.focus();
  }
  remove() {
    this.store.remove(this.pending);
    document.getElementById("titulo")?.focus();
  }
}
