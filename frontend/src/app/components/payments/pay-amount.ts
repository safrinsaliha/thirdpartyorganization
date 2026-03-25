import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-pay-amount',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pay-amount.html',
  styleUrl: '../master/branch-master.css'
})
export class PayAmount {
  private paymentService = inject(PaymentService);
  private bookingService = inject(BookingService);
  private fb = inject(FormBuilder);

  searchQuery = signal('');
  foundBooking = signal<Booking | null>(null);
  isLoading = signal(false);

  paymentForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(1)]],
    payment_mode: ['CASH', Validators.required],
    transaction_id: ['']
  });

  onSearch() {
    if (!this.searchQuery()) return;
    this.isLoading.set(true);
    this.bookingService.getBookings().subscribe(data => {
      const b = data.find(x => x.consignment_no === this.searchQuery());
      this.foundBooking.set(b || null);
      if (b) {
        this.paymentForm.patchValue({ amount: b.billing?.net_total || 0 });
      }
      this.isLoading.set(false);
    });
  }

  onSubmit() {
    if (this.paymentForm.valid && this.foundBooking()) {
      const payload = {
        booking_id: this.foundBooking()!.id!,
        ...this.paymentForm.value,
        amount: Number(this.paymentForm.value.amount)
      };

      this.paymentService.recordPayment(payload as any).subscribe(() => {
        alert('Payment recorded successfully!');
        this.foundBooking.set(null);
        this.searchQuery.set('');
        this.paymentForm.reset({ payment_mode: 'CASH' });
      });
    }
  }
}
