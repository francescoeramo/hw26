import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Property, PropertyFilters, ContactRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/properties`;

  list(filters: PropertyFilters = {}): Observable<Property[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<Property[]>(this.base, { params });
  }

  get(id: number): Observable<Property> {
    return this.http.get<Property>(`${this.base}/${id}`);
  }

  create(p: Partial<Property>): Observable<Property> {
    return this.http.post<Property>(this.base, p);
  }

  update(id: number, p: Partial<Property>): Observable<Property> {
    return this.http.put<Property>(`${this.base}/${id}`, p);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /** Ribasso del prezzo: il backend conserverà il vecchio prezzo */
  lowerPrice(id: number, newPrice: number): Observable<Property> {
    return this.http.patch<Property>(`${this.base}/${id}/lower-price`, {
      price: newPrice,
    });
  }

  /** Annunci del venditore loggato */
  mine(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.base}/mine`);
  }

  contactSeller(req: ContactRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/${req.propertyId}/contact`, req);
  }

  /** Promozione su pagina Facebook (lato backend chiamerà Graph API) */
  promoteOnFacebook(id: number): Observable<{ postUrl: string }> {
    return this.http.post<{ postUrl: string }>(
      `${this.base}/${id}/promote/facebook`,
      {}
    );
  }
}
