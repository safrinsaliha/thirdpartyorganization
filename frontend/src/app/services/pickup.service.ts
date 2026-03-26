import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pickup } from '../models/pickup.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PickupService {
  private apiUrl = '/api/pickups';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  getAllPickups(): Observable<Pickup[]> {
    return this.http.get<Pickup[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createPickup(pickup: Pickup): Observable<Pickup> {
    return this.http.post<Pickup>(this.apiUrl, pickup, { headers: this.getHeaders() });
  }

  updatePickup(id: number, data: any): Observable<Pickup> {
    return this.http.put<Pickup>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }
}
