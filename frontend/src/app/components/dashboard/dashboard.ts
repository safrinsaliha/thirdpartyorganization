import { Component, inject, signal, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { ReportService } from '../../services/report.service';
import { Booking } from '../../models/booking.model';

declare var Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit {
  private bookingService = inject(BookingService);
  private reportService = inject(ReportService);

  @ViewChild('revenueChart') revenueChartCanvas!: ElementRef;
  @ViewChild('statusChart') statusChartCanvas!: ElementRef;

  stats = signal({
    totalBookings: 0,
    pendingPickups: 0,
    inTransit: 0,
    delivered: 0,
    totalRevenue: 0
  });

  recentBookings = signal<Booking[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    // Charts will be initialized after data loads
  }

  loadDashboardData() {
    this.isLoading.set(true);
    forkJoin({
      bookings: this.bookingService.getAllBookings(),
      reportStats: this.reportService.getStats(),
      dailyData: this.reportService.getDailyBookings(),
      statusData: this.reportService.getStatusDistribution()
    }).subscribe({
      next: (data) => {
        this.recentBookings.set(data.bookings.slice(0, 5));
        
        const s = data.reportStats;
        this.stats.set({
          totalBookings: s.totalBookings,
          pendingPickups: s.pendingPickups,
          inTransit: s.inTransit,
          delivered: s.delivered,
          totalRevenue: s.totalRevenue
        });
        
        this.initCharts(data.dailyData, data.statusData);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  initCharts(dailyData: any[], statusData: any[]) {
    setTimeout(() => {
      if (this.revenueChartCanvas) {
        new Chart(this.revenueChartCanvas.nativeElement, {
          type: 'line',
          data: {
            labels: dailyData.map(d => d.date),
            datasets: [{
              label: 'Daily Bookings',
              data: dailyData.map(d => d.count),
              borderColor: '#4e73df',
              backgroundColor: 'rgba(78, 115, 223, 0.1)',
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
          }
        });
      }

      if (this.statusChartCanvas) {
        new Chart(this.statusChartCanvas.nativeElement, {
          type: 'doughnut',
          data: {
            labels: statusData.map(s => s.status),
            datasets: [{
              data: statusData.map(s => s.count),
              backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
          }
        });
      }
    }, 0);
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
