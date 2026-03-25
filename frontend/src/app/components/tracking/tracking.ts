import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking.html',
  styleUrl: './tracking.css',
})
export class Tracking {
  private bookingService = inject(BookingService);

  consignmentNo = signal('');
  trackingData = signal<Booking | null>(null);
  isLoading = signal(false);
  message = signal<string | null>(null);

  trackConsignment() {
    if (!this.consignmentNo()) return;
    
    this.isLoading.set(true);
    this.message.set(null);
    this.trackingData.set(null);
    
    this.bookingService.getAllBookings().subscribe(bookings => {
      const found = bookings.find(b => b.consignment_no === this.consignmentNo());
      
      if (found) {
        this.trackingData.set(found);
        this.isLoading.set(false);
      } else {
        this.message.set('No shipment found with this ID.');
        this.isLoading.set(false);
      }
    });
  }

  getTimelineSteps() {
    const status = this.trackingData()?.status || '';
    const steps = [
      { label: 'Booked', icon: 'bi-journal-check', active: true },
      { label: 'In Transit', icon: 'bi-truck', active: ['In Transit', 'Arrived at Branch', 'Out for Delivery', 'Delivered'].includes(status) },
      { label: 'At Branch', icon: 'bi-house-door', active: ['Arrived at Branch', 'Out for Delivery', 'Delivered'].includes(status) },
      { label: 'Out for Delivery', icon: 'bi-bicycle', active: ['Out for Delivery', 'Delivered'].includes(status) },
      { label: 'Delivered', icon: 'bi-check-all', active: status === 'Delivered' }
    ];
    return steps;
  }
}
