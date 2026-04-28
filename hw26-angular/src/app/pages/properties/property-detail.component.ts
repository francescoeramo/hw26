import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { ReviewService } from '../../core/services/review.service';
import { Property, Review, CATEGORY_LABELS, LISTING_TYPE_LABELS } from '../../core/models';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-pad">
      <div class="container" style="max-width:900px;">

        @if (loading()) {
          <p class="muted">Caricamento…</p>

        } @else if (property() === null) {
          <p class="muted">Annuncio non trovato.</p>

        } @else {
          <h1 class="serif mb-1">{{ property()!.title }}</h1>
          <p class="muted mb-3">
            <i class="bi bi-geo-alt"></i>
            {{ property()!.city }} — {{ property()!.address }}
          </p>

          <img
            [src]="property()!.photos[0] || placeholder"
            [alt]="property()!.title"
            class="rounded-3 mb-4 w-100"
            style="max-height:420px;object-fit:cover;"
          />

          <div class="row g-4">
            <div class="col-md-8">
              <div class="d-flex gap-2 mb-3">
                <span class="hw-badge primary">{{ listingLabel() }}</span>
                <span class="hw-badge">{{ catLabel() }}</span>
                <span class="hw-badge">#{{ property()!.code }}</span>
              </div>
              <p>{{ property()!.description }}</p>
              <p class="muted small">
                <strong>Superficie:</strong> {{ property()!.squareMeters }} m² &nbsp;·&nbsp;
                <strong>Venditore:</strong> {{ property()!.sellerName }}
              </p>
            </div>

            <div class="col-md-4">
              <div class="bg-white border rounded-3 p-3">
                <p class="mb-1 muted small text-uppercase" style="letter-spacing:.1em;">Prezzo</p>
                @if (property()!.oldPrice && property()!.oldPrice! > property()!.price) {
                  <span class="price-old">{{ property()!.oldPrice | number:'1.0-0' }} €</span>
                }
                <p class="fs-4 fw-bold mb-0" style="color:var(--hw-accent);">
                  {{ property()!.price | number:'1.0-0' }} €
                  @if (property()!.listingType === 'RENT') {
                    <small class="muted fs-6">/mese</small>
                  }
                </p>
              </div>
            </div>
          </div>

          <!-- Recensioni -->
          <hr class="my-4" />
          <h3 class="serif mb-3">Recensioni</h3>
          @if (reviews().length === 0) {
            <p class="muted">Nessuna recensione ancora.</p>
          } @else {
            @for (r of reviews(); track r.id) {
              <div class="bg-white border rounded-3 p-3 mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <strong>{{ r.buyerName }}</strong>
                  <span class="muted small">{{ r.rating }}/5 ★</span>
                </div>
                <p class="mb-0 small">{{ r.comment }}</p>
              </div>
            }
          }
        }

      </div>
    </section>
  `,
})
export class PropertyDetailComponent implements OnInit {
  private svc = inject(PropertyService);
  private revSvc = inject(ReviewService);
  private route = inject(ActivatedRoute);

  property = signal<Property | null>(null);
  reviews = signal<Review[]>([]);
  loading = signal(true);
  placeholder = 'https://placehold.co/900x420/eee/999?text=hw26';

  catLabel = () => {
    const p = this.property();
    return p ? CATEGORY_LABELS[p.category] : '';
  };

  listingLabel = () => {
    const p = this.property();
    return p ? LISTING_TYPE_LABELS[p.listingType] : '';
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.svc.get(id).subscribe({
      next: (p) => {
        this.property.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.property.set(null);
        this.loading.set(false);
      },
    });

    this.revSvc.getByProperty(id).subscribe({
      next: (r: Review[]) => this.reviews.set(r),
    });
  }
}