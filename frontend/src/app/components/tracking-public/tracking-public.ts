import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-tracking-public',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tracking-public.html',
  styleUrl: './tracking-public.css',
})
export class TrackingPublic {
  private bookingService = inject(BookingService);

  consignmentNo = '';
  trackingData = signal<Booking | null>(null);
  isLoading = signal(false);
  message = signal<string | null>(null);

  trackConsignment() {
    if (!this.consignmentNo) return;
    
    this.isLoading.set(true);
    this.message.set(null);
    this.trackingData.set(null);
    
    this.bookingService.publicTrack(this.consignmentNo).subscribe({
      next: (found) => {
        this.trackingData.set(found);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.message.set(err.error?.message || 'No shipment found with this ID.');
        this.isLoading.set(false);
      }
    });
  }

  getTimelineSteps() {
    const status = this.trackingData()?.status || '';
    const steps = [
      { label: 'Confirmed', icon: 'bi-check-circle', active: true },
      { label: 'In Transit', icon: 'bi-truck', active: ['In Transit', 'Arrived at Branch', 'Out for Delivery', 'Delivered'].includes(status) },
      { label: 'At Branch', icon: 'bi-house-door', active: ['Arrived at Branch', 'Out for Delivery', 'Delivered'].includes(status) },
      { label: 'Delivered', icon: 'bi-flag', active: status === 'Delivered' }
    ];
    return steps;
  }
}
