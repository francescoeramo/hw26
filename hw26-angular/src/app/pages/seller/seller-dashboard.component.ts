import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { AuctionService } from '../../core/services/auction.service';
import {
  CATEGORY_LABELS,
  LISTING_TYPE_LABELS,
  Property,
} from '../../core/models';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page-pad">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="serif mb-0">I miei annunci</h1>
          <a routerLink="/seller/new" class="btn btn-hw">+ Nuovo annuncio</a>
        </div>

        @if (loading()) {
          <p class="muted">Caricamento...</p>
        } @else if (items().length === 0) {
          <div class="text-center py-5 border border-dashed rounded-3">
            <p class="muted mb-3">Non hai ancora pubblicato annunci.</p>
            <a routerLink="/seller/new" class="btn btn-hw">Pubblica il primo</a>
          </div>
        } @else {
          <div class="table-responsive bg-white border rounded-3">
            <table class="table align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Codice</th>
                  <th>Titolo</th>
                  <th>Tipo</th>
                  <th>Categoria</th>
                  <th>Prezzo</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                @for (p of items(); track p.id) {
                  <tr>
                    <td><span class="hw-badge">{{ p.code }}</span></td>
                    <td>
                      <a [routerLink]="['/properties', p.id]">{{ p.title }}</a>
                      <div class="small muted">{{ p.city }}</div>
                    </td>
                    <td>{{ listingLabel(p) }}</td>
                    <td>{{ catLabel(p) }}</td>
                    <td>
                      @if (p.oldPrice && p.oldPrice > p.price) {
                        <span class="price-old">{{ p.oldPrice | number:'1.0-0' }} €</span>
                      }
                      <span class="price-new">{{ p.price | number:'1.0-0' }} €</span>
                    </td>
                    <td class="text-nowrap">
                      <a [routerLink]="['/seller/edit', p.id]" class="btn btn-sm btn-outline-secondary me-1">Modifica</a>
                      <button class="btn btn-sm btn-outline-secondary me-1" (click)="lower(p)">Ribassa</button>
                      <button class="btn btn-sm btn-outline-secondary me-1" (click)="createAuction(p)">Asta</button>
                      <button class="btn btn-sm btn-outline-secondary me-1" (click)="promote(p)" title="Promuovi su Facebook">
                        <i class="bi bi-facebook"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="remove(p)">Elimina</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (msg()) {
          <div class="alert alert-info mt-3 small">{{ msg() }}</div>
        }
      </div>
    </section>
  `,
})
export class SellerDashboardComponent implements OnInit {
  private svc = inject(PropertyService);
  private auc = inject(AuctionService);

  protected items = signal<Property[]>([]);
  protected loading = signal(true);
  protected msg = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.svc.mine().subscribe({
      next: (r) => {
        this.items.set(r);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  catLabel(p: Property): string {
    return CATEGORY_LABELS[p.category] ?? p.category;
  }

  listingLabel(p: Property): string {
    return LISTING_TYPE_LABELS[p.listingType] ?? p.listingType;
  }

  remove(p: Property): void {
    if (!confirm(`Eliminare "${p.title}"?`)) return;
    this.svc.delete(p.id).subscribe({ next: () => this.load() });
  }

  lower(p: Property): void {
    const v = prompt(
        `Nuovo prezzo per "${p.title}" (attuale: ${p.price} €)`,
        String(p.price - 1000)
    );
    if (!v) return;
    const n = Number(v);
    if (!n || n >= p.price) {
      this.msg.set('Il nuovo prezzo deve essere inferiore al precedente.');
      return;
    }
    this.svc.lowerPrice(p.id, n).subscribe({ next: () => this.load() });
  }

  createAuction(p: Property): void {
    const start = prompt('Prezzo di partenza (€)', String(p.price));
    if (!start) return;
    const days = prompt('Durata in giorni', '7');
    if (!days) return;
    const endsAt = new Date(
        Date.now() + Number(days) * 86400000
    ).toISOString();
    this.auc
        .create(p.id, { startPrice: Number(start), endsAt })
        .subscribe({
          next: () => this.msg.set('Asta creata.'),
          error: () => this.msg.set('Errore creazione asta.'),
        });
  }

  promote(p: Property): void {
    this.svc.promoteOnFacebook(p.id).subscribe({
      next: (r: { postUrl: string }) =>
          this.msg.set('Pubblicato su Facebook: ' + r.postUrl),
      error: () =>
          this.msg.set('Promozione non riuscita. Configura le credenziali Facebook lato backend.'),
    });
  }
}