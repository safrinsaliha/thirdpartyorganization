import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-branch-outward',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-outward.html',
  styleUrl: './branch-outward.css',
})
export class BranchOutward {
  private bookingService = inject(BookingService);

  consignmentNo = signal('');
  outwardList = signal<Booking[]>([]);
  isLoading = signal(false);
  message = signal<string | null>(null);

  processOutward() {
    if (!this.consignmentNo()) return;
    
    this.isLoading.set(true);
    this.message.set(null);
    
    this.bookingService.getAllBookings().subscribe(bookings => {
      const found = bookings.find(b => b.consignment_no === this.consignmentNo());
      
      if (found) {
        this.bookingService.updateBooking(found.id!, { status: 'Out for Delivery' }).subscribe({
          next: (updated) => {
            this.outwardList.update(list => [updated.booking, ...list]);
            this.consignmentNo.set('');
            this.isLoading.set(false);
          },
          error: () => {
            this.message.set('Failed to update status.');
            this.isLoading.set(false);
          }
        });
      } else {
        this.message.set('Consignment not found.');
        this.isLoading.set(false);
      }
    });
  }
}
