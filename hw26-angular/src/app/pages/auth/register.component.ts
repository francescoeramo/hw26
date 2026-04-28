import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page-pad">
      <div class="container" style="max-width: 520px;">
        <h1 class="serif mb-2">Crea un account</h1>
        <p class="muted mb-4">Scegli il tuo ruolo per iniziare.</p>

        <form (ngSubmit)="submit()" #f="ngForm" class="bg-white p-4 rounded-3 border">

          <div class="row g-3 mb-3">
            <div class="col">
              <label class="form-label small text-uppercase muted">Nome</label>
              <input class="form-control" name="name" [(ngModel)]="name" required minlength="3">
            </div>
            <div class="col">
              <label class="form-label small text-uppercase muted">Cognome</label>
              <input class="form-control" name="surname" [(ngModel)]="surname" required minlength="3">
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label small text-uppercase muted">Email</label>
            <input type="email" class="form-control" name="email" [(ngModel)]="email" required>
          </div>

          <div class="mb-3">
            <label class="form-label small text-uppercase muted">Password</label>
            <input type="password" class="form-control" name="password"
                   [(ngModel)]="password" required minlength="8">
            <div class="form-text small text-muted mt-1">
              Min. 8 caratteri, una maiuscola, una minuscola, un numero e un carattere speciale
              (es. <code>!</code> <code>&#64;</code> <code>#</code>).
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label small text-uppercase muted">Data di nascita</label>
            <input type="date" class="form-control" name="birthDate" [(ngModel)]="birthDate" required>
          </div>

          <div class="mb-3">
            <label class="form-label small text-uppercase muted">Ruolo</label>
            <select class="form-select" name="role" [(ngModel)]="role">
              <option value="BUYER">Acquirente</option>
              <option value="SELLER">Venditore</option>
            </select>
          </div>

          @if (role === 'SELLER') {
            <div class="mb-3">
              <label class="form-label small text-uppercase muted">Partita IVA</label>
              <input class="form-control" name="vatNumber" [(ngModel)]="vatNumber"
                     [required]="role === 'SELLER'">
              <div class="form-text small text-muted mt-1">Obbligatoria per i venditori.</div>
            </div>
          }

          @if (errors().length > 0) {
            <div class="alert alert-danger py-2 small mb-3">
              <ul class="mb-0 ps-3">
                @for (e of errors(); track e) {
                  <li>{{ e }}</li>
                }
              </ul>
            </div>
          }

          @if (success()) {
            <div class="alert alert-success py-2 small mb-3">
              Registrazione avvenuta! <a routerLink="/login">Accedi ora →</a>
            </div>
          }

          <button type="submit" class="btn btn-hw w-100"
                  [disabled]="loading() || f.invalid || success()">
            {{ loading() ? 'Attendere...' : 'Crea account' }}
          </button>

          <p class="text-center mt-3 mb-0 small muted">
            Hai già un account? <a routerLink="/login">Accedi</a>
          </p>
        </form>
      </div>
    </section>
  `,
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  protected name      = '';
  protected surname   = '';
  protected email     = '';
  protected password  = '';
  protected birthDate = '';
  protected vatNumber = '';
  protected role: 'SELLER' | 'BUYER' = 'BUYER';

  protected loading = signal(false);
  protected errors  = signal<string[]>([]);
  protected success = signal(false);

  submit(): void {
    this.loading.set(true);
    this.errors.set([]);

    this.auth.register({
      name:       this.name,
      surname:    this.surname,
      email:      this.email,
      password:   this.password,
      birthDate:  this.birthDate,
      role:       this.role,
      vatNumber:  this.role === 'SELLER' ? this.vatNumber : undefined,
    }).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        // il backend restituisce una stringa con \n tra gli errori
        const raw: string = err?.error ?? err?.message ?? 'Registrazione non riuscita';
        this.errors.set(
            raw.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        );
        this.loading.set(false);
      },
    });
  }
}