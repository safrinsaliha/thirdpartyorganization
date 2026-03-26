import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private apiUrl = '/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  getHubItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/hub-items`, { headers: this.getHeaders() });
  }

  createHubItem(item: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/hub-items`, item, { headers: this.getHeaders() });
  }

  trackShipment(consignmentNo: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/tracking/${consignmentNo}`);
  }

  assignOFD(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/delivery/ofd`, data, { headers: this.getHeaders() });
  }

  confirmDelivery(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/delivery/confirm`, data, { headers: this.getHeaders() });
  }
}
