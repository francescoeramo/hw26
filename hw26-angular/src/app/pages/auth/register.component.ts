import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  protected name         = '';
  protected surname      = '';
  protected email        = '';
  protected password     = '';
  protected birthDate    = '';
  protected role         = 'BUYER';
  protected vatNumber    = '';
  protected showPassword = signal(false);
  protected errors       = signal<string[]>([]);
  protected success      = signal(false);
  protected loading      = signal(false);

  submit(): void {
    this.loading.set(true);
    this.errors.set([]);
    const payload: Record<string, unknown> = {
      name: this.name, surname: this.surname, email: this.email,
      password: this.password, birthDate: this.birthDate, role: this.role,
    };
    if (this.role === 'SELLER') payload['vatNumber'] = this.vatNumber;
    this.auth.register(payload as any).subscribe({
      next: () => { this.success.set(true); this.loading.set(false); },
      error: (e) => {
        const msgs: string[] = e?.error?.errors ?? [e?.error?.message ?? 'Errore di registrazione.'];
        this.errors.set(msgs);
        this.loading.set(false);
      },
    });
  }
}