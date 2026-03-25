import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery.html',
  styleUrl: './delivery.css',
})
export class Delivery implements OnInit {
  private bookingService = inject(BookingService);

  allBookings = signal<Booking[]>([]);
  isLoading = signal(true);
  
  deliveryItems = computed(() => {
    return this.allBookings().filter(b => b.status === 'Out for Delivery');
  });

  ngOnInit() {
    this.loadDeliveries();
  }

  loadDeliveries() {
    this.isLoading.set(true);
    this.bookingService.getAllBookings().subscribe({
      next: (data) => {
        this.allBookings.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  confirmDelivery(id: number | undefined, success: boolean) {
    if (!id) return;
    const newStatus = success ? 'Delivered' : 'Delivery Failed';
    
    this.bookingService.updateBooking(id, { status: newStatus }).subscribe(() => {
      this.loadDeliveries();
    });
  }
}
