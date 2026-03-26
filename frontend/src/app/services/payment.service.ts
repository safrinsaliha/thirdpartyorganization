import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Payment {
  id?: number;
  booking_id: number;
  amount: number;
  payment_mode: string;
  transaction_id?: string;
  status?: string;
}

export interface Wallet {
  id?: number;
  user_id: number;
  balance: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = '/api';

  recordPayment(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/payments`, payment);
  }

  getWalletBalance(): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.apiUrl}/wallet/balance`);
  }
}
