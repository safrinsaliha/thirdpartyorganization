import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = '/api/bookings';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getBookings(): Observable<Booking[]> {
    return this.getAllBookings();
  }

  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createBooking(booking: Booking): Observable<any> {
    return this.http.post(this.apiUrl, booking, { headers: this.getHeaders() });
  }

  updateBooking(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  deleteBooking(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  publicTrack(consignmentNo: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/track/${consignmentNo}`);
  }
}
