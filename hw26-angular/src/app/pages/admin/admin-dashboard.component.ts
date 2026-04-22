import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { PropertyService } from '../../core/services/property.service';
import { Property, ROLE_LABELS, Role, User } from '../../core/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page-pad">
      <div class="container">
        <h1 class="serif mb-4">Pannello Amministratore</h1>

        <ul class="nav nav-pills mb-4">
          <li class="nav-item">
            <a class="nav-link" [class.active]="tab() === 'users'" (click)="tab.set('users')" style="cursor:pointer;">
              Utenti
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" [class.active]="tab() === 'properties'" (click)="tab.set('properties')" style="cursor:pointer;">
              Annunci
            </a>
          </li>
        </ul>

        @if (tab() === 'users') {
          <div class="table-responsive bg-white border rounded-3">
            <table class="table align-middle mb-0">
              <thead class="table-light">
                <tr><th>Username</th><th>Email</th><th>Ruolo</th><th>Stato</th><th>Azioni</th></tr>
              </thead>
              <tbody>
                @for (u of users(); track u.id) {
                  <tr>
                    <td>{{ u.username }}</td>
                    <td class="muted small">{{ u.email }}</td>
                    <td>
                      <select class="form-select form-select-sm" [ngModel]="u.role"
                              (ngModelChange)="changeRole(u, $event)">
                        @for (r of roles; track r) {
                          <option [value]="r">{{ roleLabel(r) }}</option>
                        }
                      </select>
                    </td>
                    <td>
                      @if (u.banned) {
                        <span class="hw-badge danger">Bannato</span>
                      } @else {
                        <span class="hw-badge">Attivo</span>
                      }
                    </td>
                    <td class="text-nowrap">
                      <button class="btn btn-sm btn-outline-warning me-1" (click)="toggleBan(u)">
                        {{ u.banned ? 'Sblocca' : 'Banna' }}
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteUser(u)">Elimina</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (tab() === 'properties') {
          <div class="table-responsive bg-white border rounded-3">
            <table class="table align-middle mb-0">
              <thead class="table-light">
                <tr><th>Codice</th><th>Titolo</th><th>Venditore</th><th>Prezzo</th><th></th></tr>
              </thead>
              <tbody>
                @for (p of properties(); track p.id) {
                  <tr>
                    <td>{{ p.code }}</td>
                    <td><a [routerLink]="['/properties', p.id]">{{ p.title }}</a></td>
                    <td>{{ p.sellerName }}</td>
                    <td>{{ p.price | number:'1.0-0' }} €</td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteProperty(p)">Elimina</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </section>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private userSvc = inject(UserService);
  private propSvc = inject(PropertyService);

  protected tab = signal<'users' | 'properties'>('users');
  protected users = signal<User[]>([]);
  protected properties = signal<Property[]>([]);
  protected roles: Role[] = ['ADMIN', 'SELLER', 'BUYER'];

  ngOnInit(): void {
    this.userSvc.list().subscribe({ next: (r) => this.users.set(r) });
    this.propSvc.list().subscribe({ next: (r) => this.properties.set(r) });
  }

  roleLabel(r: Role): string {
    return ROLE_LABELS[r];
  }

  toggleBan(u: User): void {
    this.userSvc.ban(u.id, !u.banned).subscribe({
      next: (nu) =>
        this.users.update((arr) => arr.map((x) => (x.id === nu.id ? nu : x))),
    });
  }

  changeRole(u: User, role: Role): void {
    this.userSvc.setRole(u.id, role).subscribe({
      next: (nu) =>
        this.users.update((arr) => arr.map((x) => (x.id === nu.id ? nu : x))),
    });
  }

  deleteUser(u: User): void {
    if (!confirm(`Eliminare ${u.username}?`)) return;
    this.userSvc.delete(u.id).subscribe({
      next: () =>
        this.users.update((arr) => arr.filter((x) => x.id !== u.id)),
    });
  }

  deleteProperty(p: Property): void {
    if (!confirm(`Eliminare "${p.title}"?`)) return;
    this.propSvc.delete(p.id).subscribe({
      next: () =>
        this.properties.update((arr) => arr.filter((x) => x.id !== p.id)),
    });
  }
}
