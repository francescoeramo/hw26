import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review } from '../models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  byProperty(propertyId: number): Observable<Review[]> {
    return this.http.get<Review[]>(
      `${this.base}/properties/${propertyId}/reviews`
    );
  }

  create(
    propertyId: number,
    payload: { rating: number; comment: string }
  ): Observable<Review> {
    return this.http.post<Review>(
      `${this.base}/properties/${propertyId}/reviews`,
      payload
    );
  }

  delete(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/reviews/${reviewId}`);
  }
}
