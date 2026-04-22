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
          <div class="mb-3">
            <label class="form-label small text-uppercase muted">Username</label>
            <input class="form-control" name="username" [(ngModel)]="username" required minlength="3">
          </div>
          <div class="mb-3">
            <label class="form-label small text-uppercase muted">Email</label>
            <input type="email" class="form-control" name="email" [(ngModel)]="email" required>
          </div>
          <div class="mb-3">
            <label class="form-label small text-uppercase muted">Password</label>
            <input type="password" class="form-control" name="password" [(ngModel)]="password" required minlength="6">
          </div>
          <div class="mb-3">
            <label class="form-label small text-uppercase muted">Ruolo</label>
            <select class="form-select" name="role" [(ngModel)]="role">
              <option value="BUYER">Acquirente</option>
              <option value="SELLER">Venditore</option>
            </select>
          </div>
          @if (error()) {
            <div class="alert alert-danger py-2 small">{{ error() }}</div>
          }
          <button type="submit" class="btn btn-hw w-100" [disabled]="loading() || f.invalid">
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

  protected username = '';
  protected email = '';
  protected password = '';
  protected role: 'SELLER' | 'BUYER' = 'BUYER';
  protected loading = signal(false);
  protected error = signal<string | null>(null);

  submit(): void {
    this.loading.set(true);
    this.error.set(null);
    this.auth
      .register({
        username: this.username,
        email: this.email,
        password: this.password,
        role: this.role,
      })
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Registrazione non riuscita');
          this.loading.set(false);
        },
      });
  }
}
