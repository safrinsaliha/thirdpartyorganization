import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tariff {
  id?: number;
  origin_city: string;
  dest_city: string;
  service_type_id: number;
  rate_per_kg: number;
  min_weight: number;
  min_amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class TariffService {
  private http = inject(HttpClient);
  private apiUrl = '/api';

  getTariffs(): Observable<Tariff[]> {
    return this.http.get<Tariff[]>(`${this.apiUrl}/tariffs`);
  }

  lookupRate(origin: string, destination: string, service_type_id: number): Observable<Tariff> {
    return this.http.post<Tariff>(`${this.apiUrl}/tariffs/lookup`, { origin, destination, service_type_id });
  }
}
