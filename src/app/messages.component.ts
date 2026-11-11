import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";

interface Message { id: number; message: string; }

@Component({
  selector: "app-messages",
  imports: [FormsModule],
  template: `
    <h1>Mensajes compartidos</h1>
    <p class="lead">Envía un mensaje y consúltalo desde cualquier navegador conectado a esta instancia.</p>
    <p role="status">{{ status() }}</p>
    <form (ngSubmit)="save()">
      <label for="shared-message">Mensaje (máximo 1000 caracteres)</label>
      <textarea id="shared-message" name="message" [(ngModel)]="draft" required maxlength="1000" [disabled]="busy()"></textarea>
      <button type="submit" [disabled]="busy() || !draft.trim()">Guardar mensaje</button>
    </form>
    <p role="status" aria-live="polite">{{ notice() }}</p>
    <p class="error" role="alert">{{ error() }}</p>
    <h2>Mensajes guardados</h2>
    <button type="button" (click)="refresh()" [disabled]="busy()">Actualizar</button>
    <ul>
      @for (item of messages(); track item.id) {
        <li><strong>#{{ item.id }}</strong> {{ item.message }}</li>
      } @empty { <li>No hay mensajes para mostrar.</li> }
    </ul>
  `,
})
export class MessagesComponent implements OnInit {
  draft = "";
  messages = signal<Message[]>([]);
  status = signal("Comprobando conexión…");
  notice = signal("");
  error = signal("");
  busy = signal(false);

  ngOnInit() { void this.refresh(); }

  private async request(path: string, options?: RequestInit) {
    const response = await fetch(`/api/${path}`, {
      ...options, signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("No se pudo completar la solicitud.");
    return response.json();
  }

  async refresh() {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set("");
    try {
      const health = await this.request("status");
      if (health.status !== "ok") throw new Error("API no disponible");
      this.messages.set(await this.request("messages"));
      this.status.set("Conectado al servicio de mensajes.");
    } catch {
      this.status.set("Sin conexión al servicio de mensajes.");
      this.error.set("No se pudieron consultar los mensajes. Intenta actualizar de nuevo.");
    } finally { this.busy.set(false); }
  }

  async save() {
    if (this.busy() || !this.draft.trim() || this.draft.trim().length > 1000) return;
    this.busy.set(true);
    this.error.set("");
    this.notice.set("");
    let saved = false;
    try {
      await this.request("messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: this.draft.trim() }),
      });
      saved = true;
      this.draft = "";
      this.notice.set("Mensaje guardado en el servidor.");
      this.messages.set(await this.request("messages"));
      this.status.set("Conectado al servicio de mensajes.");
    } catch {
      this.error.set(saved
        ? "El mensaje se guardó, pero no se pudo actualizar la lista. Pulsa Actualizar."
        : "No se pudo confirmar el guardado. Actualiza la lista antes de intentar de nuevo.");
    } finally { this.busy.set(false); }
  }
}
