import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PropertyService } from '../../core/services/property.service';
import { ReviewService } from '../../core/services/review.service';
import { AuctionService } from '../../core/services/auction.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Auction,
  CATEGORY_LABELS,
  LISTING_TYPE_LABELS,
  Property,
  Review,
} from '../../core/models';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    @if (loading()) {
      <div class="container page-pad"><p class="muted">Caricamento...</p></div>
    } @else if (error()) {
      <div class="container page-pad"><div class="alert alert-warning">{{ error() }}</div></div>
    } @else if (property(); as p) {
      <section class="page-pad">
        <div class="container">
          <a routerLink="/properties" class="muted small text-decoration-none">
            <i class="bi bi-arrow-left"></i> Torna agli annunci
          </a>

          <div class="row g-4 mt-2">
            <div class="col-lg-7">
              <div class="ratio ratio-16x9 rounded-3 overflow-hidden bg-light mb-2">
                <img [src]="activePhoto()" [alt]="p.title" class="w-100 h-100" style="object-fit:cover;">
              </div>
              <div class="d-flex gap-2 flex-wrap">
                @for (ph of p.photos; track ph; let i = $index) {
                  <img [src]="ph" alt="thumb" (click)="activeIdx.set(i)"
                       class="rounded border" style="width:90px;height:70px;object-fit:cover;cursor:pointer;"
                       [style.borderColor]="i === activeIdx() ? 'var(--hw-primary)' : '#ddd'">
                }
              </div>
            </div>

            <div class="col-lg-5">
              <div class="d-flex gap-2 mb-2">
                <span class="hw-badge primary">{{ listingLabel(p) }}</span>
                <span class="hw-badge">{{ catLabel(p) }}</span>
                <span class="hw-badge">#{{ p.code }}</span>
              </div>
              <h1 class="serif">{{ p.title }}</h1>
              <p class="muted"><i class="bi bi-geo-alt"></i> {{ p.address }}, {{ p.city }}</p>

              <div class="my-3 fs-3">
                @if (p.oldPrice && p.oldPrice > p.price) {
                  <span class="price-old">{{ p.oldPrice | number:'1.0-0' }} €</span>
                }
                <span class="price-new">{{ p.price | number:'1.0-0' }} €</span>
                @if (p.listingType === 'RENT') { <small class="muted fs-6">/mese</small> }
              </div>

              <p><strong>{{ p.squareMeters }} m²</strong> &nbsp;·&nbsp; Venditore: <em>{{ p.sellerName }}</em></p>
              <p>{{ p.description }}</p>

              <hr>
              <h5 class="serif">Contatta il venditore</h5>
              <form (ngSubmit)="sendContact()" #cf="ngForm" class="row g-2">
                <div class="col-12">
                  <input class="form-control form-control-sm" placeholder="Nome" name="name" [(ngModel)]="contact.fromName" required>
                </div>
                <div class="col-12">
                  <input class="form-control form-control-sm" type="email" placeholder="Email" name="email" [(ngModel)]="contact.fromEmail" required>
                </div>
                <div class="col-12">
                  <input class="form-control form-control-sm" placeholder="Telefono (opzionale)" name="phone" [(ngModel)]="contact.fromPhone">
                </div>
                <div class="col-12">
                  <textarea class="form-control form-control-sm" rows="3"
                    [placeholder]="'Sono interessato all’annuncio #' + p.code + ' — ' + p.title"
                    name="message" [(ngModel)]="contact.message" required></textarea>
                </div>
                <div class="col-12">
                  <button class="btn btn-hw btn-sm w-100" [disabled]="cf.invalid || sending()">
                    {{ sending() ? 'Invio...' : 'Invia richiesta' }}
                  </button>
                </div>
                @if (contactSent()) { <p class="small text-success mt-2">Messaggio inviato!</p> }
              </form>
            </div>
          </div>

          <!-- Mappa Google -->
          <div class="mt-5">
            <h3 class="serif mb-3">Posizione</h3>
            <div class="ratio ratio-16x9 rounded-3 overflow-hidden border">
              <iframe [src]="mapUrl()" loading="lazy" style="border:0;"></iframe>
            </div>
            <p class="muted small mt-1">Lat {{ p.latitude }}, Lng {{ p.longitude }}</p>
          </div>

          <!-- Asta -->
          @if (auction(); as a) {
            <div class="mt-5 p-4 bg-white border rounded-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h3 class="serif mb-0">Asta in corso</h3>
                <span class="hw-badge accent">Termina il {{ a.endsAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <p>Offerta attuale: <strong>{{ a.currentBid | number:'1.0-0' }} €</strong>
                 ({{ a.bidsCount }} offerte)</p>

              @if (auth.hasRole('BUYER')) {
                <form class="row g-2 align-items-end" (ngSubmit)="placeBid(a)">
                  <div class="col-sm-6">
                    <label class="form-label small">La tua offerta (€)</label>
                    <input type="number" class="form-control form-control-sm"
                           [min]="a.currentBid + 1" [(ngModel)]="bidAmount" name="bid">
                  </div>
                  <div class="col-sm-6">
                    <button class="btn btn-hw btn-sm w-100">Fai un'offerta</button>
                  </div>
                </form>
              } @else {
                <p class="small muted">Accedi come acquirente per fare un'offerta.</p>
              }
            </div>
          }

          <!-- Recensioni -->
          <div class="mt-5">
            <h3 class="serif mb-3">Recensioni</h3>
            @if (reviews().length === 0) {
              <p class="muted">Ancora nessuna recensione.</p>
            }
            @for (r of reviews(); track r.id) {
              <div class="border rounded-3 p-3 mb-2 bg-white">
                <div class="d-flex justify-content-between">
                  <strong>{{ r.buyerName }}</strong>
                  <span class="text-warning">
                    @for (s of stars(r.rating); track $index) { <i class="bi bi-star-fill"></i> }
                  </span>
                </div>
                <p class="mb-1 small muted">{{ r.createdAt | date:'dd/MM/yyyy' }}</p>
                <p class="mb-0">{{ r.comment }}</p>
              </div>
            }

            @if (auth.hasRole('BUYER')) {
              <form (ngSubmit)="postReview()" class="border rounded-3 p-3 bg-white mt-3">
                <h6>Lascia una recensione</h6>
                <div class="row g-2">
                  <div class="col-sm-3">
                    <label class="form-label small">Voto (1-5)</label>
                    <input type="number" min="1" max="5" class="form-control form-control-sm"
                           [(ngModel)]="newReview.rating" name="rating" required>
                  </div>
                  <div class="col-sm-9">
                    <label class="form-label small">Commento</label>
                    <textarea class="form-control form-control-sm" rows="2"
                              [(ngModel)]="newReview.comment" name="comment" required></textarea>
                  </div>
                  <div class="col-12">
                    <button class="btn btn-hw btn-sm">Pubblica</button>
                  </div>
                </div>
              </form>
            }
          </div>
        </div>
      </section>
    }
  `,
})
export class PropertyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private propSvc = inject(PropertyService);
  private revSvc = inject(ReviewService);
  private aucSvc = inject(AuctionService);
  private sanitizer = inject(DomSanitizer);
  protected auth = inject(AuthService);

  protected property = signal<Property | null>(null);
  protected reviews = signal<Review[]>([]);
  protected auction = signal<Auction | null>(null);
  protected loading = signal(true);
  protected error = signal<string | null>(null);
  protected activeIdx = signal(0);
  protected sending = signal(false);
  protected contactSent = signal(false);
  protected bidAmount = 0;

  protected contact = {
    fromName: '',
    fromEmail: '',
    fromPhone: '',
    message: '',
  };

  protected newReview = { rating: 5, comment: '' };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('Annuncio non trovato');
      this.loading.set(false);
      return;
    }
    this.propSvc.get(id).subscribe({
      next: (p) => {
        this.property.set(p);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Errore caricamento');
        this.loading.set(false);
      },
    });
    this.revSvc.byProperty(id).subscribe({
      next: (r) => this.reviews.set(r),
      error: () => {},
    });
    this.aucSvc.byProperty(id).subscribe({
      next: (a) => {
        this.auction.set(a);
        if (a) this.bidAmount = a.currentBid + 1;
      },
      error: () => {},
    });
  }

  activePhoto(): string {
    const p = this.property();
    if (!p) return '';
    return p.photos[this.activeIdx()] ?? p.photos[0] ?? '';
  }

  catLabel(p: Property): string {
    return CATEGORY_LABELS[p.category] ?? p.category;
  }
  listingLabel(p: Property): string {
    return LISTING_TYPE_LABELS[p.listingType] ?? p.listingType;
  }

  mapUrl(): SafeResourceUrl {
    const p = this.property()!;
    const url = `https://www.google.com/maps?q=${p.latitude},${p.longitude}&z=15&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  stars(n: number): number[] {
    return Array.from({ length: Math.max(0, Math.min(5, n)) });
  }

  sendContact(): void {
    const p = this.property();
    if (!p) return;
    this.sending.set(true);
    this.propSvc
      .contactSeller({ propertyId: p.id, ...this.contact })
      .subscribe({
        next: () => {
          this.contactSent.set(true);
          this.sending.set(false);
        },
        error: () => this.sending.set(false),
      });
  }

  postReview(): void {
    const p = this.property();
    if (!p) return;
    this.revSvc.create(p.id, this.newReview).subscribe({
      next: (r) => {
        this.reviews.update((arr) => [r, ...arr]);
        this.newReview = { rating: 5, comment: '' };
      },
    });
  }

  placeBid(a: Auction): void {
    this.aucSvc.placeBid(a.id, this.bidAmount).subscribe({
      next: () => {
        this.aucSvc.byProperty(a.propertyId).subscribe({
          next: (na) => this.auction.set(na),
        });
      },
    });
  }
}
