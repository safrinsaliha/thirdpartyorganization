import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeliveryService } from '../../services/delivery.service';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-delivery-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './delivery-entry.html',
  styleUrl: '../master/branch-master.css'
})
export class DeliveryEntry {
  private deliveryService = inject(DeliveryService);
  private bookingService = inject(BookingService);
  private fb = inject(FormBuilder);

  ofdBookings = signal<Booking[]>([]);
  selectedBooking = signal<Booking | null>(null);
  isLoading = signal(false);

  deliveryForm = this.fb.group({
    status: ['Delivered', Validators.required],
    receiver_name: ['', Validators.required],
    receiver_phone: ['', Validators.required],
    remarks: ['']
  });

  ngOnInit() {
    this.loadOFDBookings();
  }

  loadOFDBookings() {
    this.isLoading.set(true);
    this.bookingService.getBookings().subscribe(data => {
      this.ofdBookings.set(data.filter(b => b.status === 'Out for Delivery'));
      this.isLoading.set(false);
    });
  }

  selectBooking(booking: Booking) {
    this.selectedBooking.set(booking);
    this.deliveryForm.patchValue({
      receiver_name: booking.consignee_name || '',
      receiver_phone: booking.consignee_mobile || ''
    });
  }

  onSubmit() {
    if (this.deliveryForm.valid && this.selectedBooking()) {
      const payload = {
        booking_id: this.selectedBooking()!.id,
        ...this.deliveryForm.value
      };

      this.deliveryService.confirmDelivery(payload).subscribe(() => {
        this.loadOFDBookings();
        this.selectedBooking.set(null);
        this.deliveryForm.reset({ status: 'Delivered' });
        alert('Delivery confirmed successfully!');
      });
    }
  }
}
