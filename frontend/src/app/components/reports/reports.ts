import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { ReportService } from '../../services/report.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit {
  private bookingService = inject(BookingService);
  private reportService = inject(ReportService);

  bookings = signal<Booking[]>([]);
  reportStats = signal({
    totalRevenue: 0,
    deliveredPercent: 0,
    avgWeight: 0,
    totalBookings: 0,
    pickupAcceptance: 0
  });
  isLoading = signal(true);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    forkJoin({
      bookings: this.bookingService.getAllBookings(),
      stats: this.reportService.getStats()
    }).subscribe({
      next: (data) => {
        this.bookings.set(data.bookings);
        
        // Map backend stats to frontend structure
        const s = data.stats;
        this.reportStats.set({
          totalRevenue: s.totalRevenue,
          deliveredPercent: s.totalBookings ? Math.round((s.delivered / s.totalBookings) * 100) : 0,
          avgWeight: s.totalBookings ? Math.round(s.totalRevenue / s.totalBookings / 10) : 0, // Placeholder calculation if not from backend
          totalBookings: s.totalBookings,
          pickupAcceptance: (s.pendingPickups === 0) ? 100 : 85 // Placeholder logic
        });
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getStatusClass(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'booked': return 'badge bg-primary';
      case 'in transit': return 'badge bg-warning text-dark';
      case 'delivered': return 'badge bg-success';
      case 'cancelled': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
}
