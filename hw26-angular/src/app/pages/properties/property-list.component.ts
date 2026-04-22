import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import {
  CATEGORY_LABELS,
  Property,
  PropertyCategory,
  PropertyFilters,
  ListingType,
} from '../../core/models';
import { PropertyCardComponent } from '../../shared/components/property-card.component';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PropertyCardComponent],
  template: `
    <section class="page-pad">
      <div class="container">
        <h1 class="serif mb-2">Annunci</h1>
        <p class="muted mb-4">{{ items().length }} risultati</p>

        <div class="row g-4">
          <aside class="col-lg-3">
            <div class="bg-white border rounded-3 p-3">
              <h6 class="text-uppercase small muted">Filtri</h6>

              <div class="mb-3">
                <label class="form-label small">Cerca</label>
                <input class="form-control form-control-sm" [(ngModel)]="filters.q"
                       (keyup.enter)="reload()" placeholder="Città, titolo...">
              </div>

              <div class="mb-3">
                <label class="form-label small">Tipo</label>
                <select class="form-select form-select-sm" [(ngModel)]="filters.listingType" (change)="reload()">
                  <option [ngValue]="undefined">Tutti</option>
                  <option value="SALE">Vendita</option>
                  <option value="RENT">Affitto</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small">Categoria</label>
                <select class="form-select form-select-sm" [(ngModel)]="filters.category" (change)="reload()">
                  <option [ngValue]="undefined">Tutte</option>
                  @for (c of categories; track c.value) {
                    <option [value]="c.value">{{ c.label }}</option>
                  }
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small">Città</label>
                <input class="form-control form-control-sm" [(ngModel)]="filters.city" (change)="reload()">
              </div>

              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label small">Prezzo min</label>
                  <input type="number" class="form-control form-control-sm"
                         [(ngModel)]="filters.minPrice" (change)="reload()">
                </div>
                <div class="col-6">
                  <label class="form-label small">Prezzo max</label>
                  <input type="number" class="form-control form-control-sm"
                         [(ngModel)]="filters.maxPrice" (change)="reload()">
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small">m² minimi</label>
                <input type="number" class="form-control form-control-sm"
                       [(ngModel)]="filters.minSquareMeters" (change)="reload()">
              </div>

              <button class="btn btn-hw-outline btn-sm w-100" (click)="clear()">Azzera filtri</button>
            </div>
          </aside>

          <div class="col-lg-9">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="muted small">Ordina per</span>
              <select class="form-select form-select-sm" style="max-width:240px;"
                      [(ngModel)]="filters.sort" (change)="reload()">
                <option value="newest">Più recenti</option>
                <option value="price-asc">Prezzo crescente</option>
                <option value="price-desc">Prezzo decrescente</option>
                <option value="sqm-desc">Metratura maggiore</option>
              </select>
            </div>

            @if (loading()) {
              <p class="muted">Caricamento...</p>
            } @else if (error()) {
              <div class="alert alert-warning">{{ error() }}</div>
            } @else if (items().length === 0) {
              <div class="text-center py-5 border border-dashed rounded-3">
                <p class="muted mb-0">Nessun annuncio corrisponde ai criteri.</p>
              </div>
            } @else {
              <div class="row g-4">
                @for (p of items(); track p.id) {
                  <div class="col-sm-6 col-xl-4">
                    <app-property-card [property]="p"></app-property-card>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class PropertyListComponent implements OnInit {
  private svc = inject(PropertyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected items = signal<Property[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  protected filters: PropertyFilters = { sort: 'newest' };

  protected categories: { value: PropertyCategory; label: string }[] = (
    Object.keys(CATEGORY_LABELS) as PropertyCategory[]
  ).map((v) => ({ value: v, label: CATEGORY_LABELS[v] }));

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    this.filters = {
      q: qp.get('q') ?? undefined,
      city: qp.get('city') ?? undefined,
      category: (qp.get('category') as PropertyCategory) ?? undefined,
      listingType: (qp.get('listingType') as ListingType) ?? undefined,
      minPrice: qp.get('minPrice') ? Number(qp.get('minPrice')) : undefined,
      maxPrice: qp.get('maxPrice') ? Number(qp.get('maxPrice')) : undefined,
      minSquareMeters: qp.get('minSquareMeters')
        ? Number(qp.get('minSquareMeters'))
        : undefined,
      sort:
        (qp.get('sort') as PropertyFilters['sort']) ?? 'newest',
    };
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.router.navigate([], {
      queryParams: this.filters as Record<string, unknown>,
      replaceUrl: true,
    });
    this.svc.list(this.filters).subscribe({
      next: (res) => {
        this.items.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          'Impossibile caricare gli annunci dal backend (' +
            (err?.message ?? 'errore') +
            ')'
        );
        this.loading.set(false);
      },
    });
  }

  clear(): void {
    this.filters = { sort: 'newest' };
    this.reload();
  }
}
