import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import {
  CATEGORY_LABELS,
  Property,
  PropertyCategory,
} from '../../core/models';

@Component({
  selector: 'app-property-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page-pad">
      <div class="container" style="max-width: 760px;">
        <a routerLink="/seller" class="muted small text-decoration-none">
          <i class="bi bi-arrow-left"></i> Torna ai miei annunci
        </a>
        <h1 class="serif mt-2 mb-4">{{ isNew ? 'Nuovo annuncio' : 'Modifica annuncio' }}</h1>

        <form (ngSubmit)="save()" #f="ngForm" class="bg-white border rounded-3 p-4">
          <div class="mb-3">
            <label class="form-label small text-uppercase muted">Titolo</label>
            <input class="form-control" name="title" [(ngModel)]="model.title" required>
          </div>

          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small text-uppercase muted">Tipo</label>
              <select class="form-select" name="listingType" [(ngModel)]="model.listingType" required>
                <option value="SALE">Vendita</option>
                <option value="RENT">Affitto</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label small text-uppercase muted">Categoria</label>
              <select class="form-select" name="category" [(ngModel)]="model.category" required>
                @for (c of categories; track c.value) {
                  <option [value]="c.value">{{ c.label }}</option>
                }
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-uppercase muted">Prezzo (€)</label>
              <input type="number" class="form-control" name="price" [(ngModel)]="model.price" required>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-uppercase muted">Metri quadri</label>
              <input type="number" class="form-control" name="sqm" [(ngModel)]="model.squareMeters" required>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-uppercase muted">Città</label>
              <input class="form-control" name="city" [(ngModel)]="model.city" required>
            </div>
            <div class="col-12">
              <label class="form-label small text-uppercase muted">Indirizzo</label>
              <input class="form-control" name="address" [(ngModel)]="model.address" required>
            </div>
            <div class="col-md-6">
              <label class="form-label small text-uppercase muted">Latitudine</label>
              <input type="number" step="0.0001" class="form-control" name="lat" [(ngModel)]="model.latitude">
            </div>
            <div class="col-md-6">
              <label class="form-label small text-uppercase muted">Longitudine</label>
              <input type="number" step="0.0001" class="form-control" name="lng" [(ngModel)]="model.longitude">
            </div>
            <div class="col-12">
              <label class="form-label small text-uppercase muted">Foto (URL, una per riga)</label>
              <textarea class="form-control" rows="3" name="photos"
                [ngModel]="photosText" (ngModelChange)="onPhotosChange($event)"></textarea>
            </div>
            <div class="col-12">
              <label class="form-label small text-uppercase muted">Descrizione</label>
              <textarea class="form-control" rows="5" name="description" [(ngModel)]="model.description" required></textarea>
            </div>
          </div>

          @if (error()) { <div class="alert alert-danger mt-3 py-2 small">{{ error() }}</div> }

          <div class="mt-4 d-flex gap-2">
            <button class="btn btn-hw" [disabled]="f.invalid || saving()">
              {{ saving() ? 'Salvataggio...' : 'Salva' }}
            </button>
            <a routerLink="/seller" class="btn btn-link">Annulla</a>
          </div>
        </form>
      </div>
    </section>
  `,
})
export class PropertyEditComponent implements OnInit {
  private svc = inject(PropertyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected isNew = true;
  protected saving = signal(false);
  protected error = signal<string | null>(null);
  protected photosText = '';

  protected categories: { value: PropertyCategory; label: string }[] = (
    Object.keys(CATEGORY_LABELS) as PropertyCategory[]
  ).map((v) => ({ value: v, label: CATEGORY_LABELS[v] }));

  protected model: Partial<Property> = {
    title: '',
    description: '',
    listingType: 'SALE',
    category: 'APARTMENT',
    price: 0,
    squareMeters: 0,
    city: '',
    address: '',
    latitude: 41.9,
    longitude: 12.5,
    photos: [],
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isNew = false;
      this.svc.get(Number(id)).subscribe({
        next: (p) => {
          this.model = { ...p };
          this.photosText = (p.photos ?? []).join('\n');
        },
      });
    }
  }

  onPhotosChange(value: string): void {
    this.photosText = value;
    this.model.photos = value
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  save(): void {
    this.saving.set(true);
    this.error.set(null);
    const op$ = this.isNew
      ? this.svc.create(this.model)
      : this.svc.update(this.model.id!, this.model);
    op$.subscribe({
      next: () => this.router.navigate(['/seller']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Salvataggio non riuscito');
        this.saving.set(false);
      },
    });
  }
}
