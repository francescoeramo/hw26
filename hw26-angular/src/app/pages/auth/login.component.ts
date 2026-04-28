import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page-pad">
      <div class="container" style="max-width: 480px;">
        <h1 class="serif mb-2">Accedi</h1>
        <p class="muted mb-4">Bentornato su hw26.</p>

        <form (ngSubmit)="submit()" #f="ngForm" class="bg-white p-4 rounded-3 border">
          <div class="mb-3">
            <label class="form-label small text-uppercase muted">Email</label>
            <input type="email" class="form-control" name="email" [(ngModel)]="email" required>
          </div>
          <div class="mb-3">
            <label class="form-label small text-uppercase muted">Password</label>
            <input type="password" class="form-control" name="password" [(ngModel)]="password" required>
          </div>
          @if (error()) {
            <div class="alert alert-danger py-2 small">{{ error() }}</div>
          }
          <button type="submit" class="btn btn-hw w-100" [disabled]="loading() || f.invalid">
            {{ loading() ? 'Attendere...' : 'Accedi' }}
          </button>
          <p class="text-center mt-3 mb-0 small muted">
            Non hai un account? <a routerLink="/register">Registrati</a>
          </p>
        </form>
      </div>
    </section>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  protected email = '';
  protected password = '';
  protected loading = signal(false);
  protected error = signal<string | null>(null);

  submit(): void {
    this.loading.set(true);
    this.error.set(null);
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Credenziali non valide');
        this.loading.set(false);
      },
    });
  }
}