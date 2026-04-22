import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CATEGORY_LABELS,
  LISTING_TYPE_LABELS,
  Property,
} from '../../core/models';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a [routerLink]="['/properties', property.id]" class="text-decoration-none text-reset">
      <article class="property-card h-100">
        <div class="img-wrap">
          <img
            [src]="property.photos[0] || placeholder"
            [alt]="property.title"
            loading="lazy"
          />
        </div>
        <div class="p-3 d-flex flex-column flex-grow-1">
          <div class="d-flex gap-2 mb-2">
            <span class="hw-badge primary">{{ listingLabel }}</span>
            <span class="hw-badge">{{ categoryLabel }}</span>
          </div>
          <h5 class="serif mb-1">{{ property.title }}</h5>
          <p class="muted small mb-2">
            <i class="bi bi-geo-alt"></i> {{ property.city }} — {{ property.address }}
          </p>
          <p class="mb-3">
            @if (property.oldPrice && property.oldPrice > property.price) {
              <span class="price-old">{{ property.oldPrice | number:'1.0-0' }} €</span>
            }
            <span class="price-new fs-5">
              {{ property.price | number:'1.0-0' }} €
              @if (property.listingType === 'RENT') { <small class="muted">/mese</small> }
            </span>
          </p>
          <div class="mt-auto pt-2 border-top small muted d-flex justify-content-between">
            <span><i class="bi bi-rulers"></i> {{ property.squareMeters }} m²</span>
            <span class="text-uppercase">#{{ property.code }}</span>
          </div>
        </div>
      </article>
    </a>
  `,
})
export class PropertyCardComponent {
  @Input({ required: true }) property!: Property;
  protected placeholder =
    'https://placehold.co/600x450/eee/999?text=hw26';

  protected get categoryLabel(): string {
    return CATEGORY_LABELS[this.property.category] ?? this.property.category;
  }

  protected get listingLabel(): string {
    return (
      LISTING_TYPE_LABELS[this.property.listingType] ?? this.property.listingType
    );
  }
}
