import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:5000/api/reports';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`, { headers: this.getHeaders() });
  }

  getDailyBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/daily-bookings`, { headers: this.getHeaders() });
  }

  getServiceRevenue(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/service-revenue`, { headers: this.getHeaders() });
  }

  getStatusDistribution(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/status-distribution`, { headers: this.getHeaders() });
  }
}
