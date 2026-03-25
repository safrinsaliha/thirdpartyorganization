import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeliveryService } from '../../services/delivery.service';
import { MasterService, Staff } from '../../services/master.service';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-ofd',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ofd.html',
  styleUrl: '../master/branch-master.css'
})
export class OFDComponent {
  private deliveryService = inject(DeliveryService);
  private masterService = inject(MasterService);
  private bookingService = inject(BookingService);
  private fb = inject(FormBuilder);

  availableBookings = signal<Booking[]>([]);
  drivers = signal<Staff[]>([]);
  selectedBookings = new Set<number>();
  isLoading = signal(false);

  ofdForm = this.fb.group({
    staff_id: [null, Validators.required],
    vehicle_no: ['', Validators.required]
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    // Load bookings that are 'In Transit' or at the branch
    this.bookingService.getBookings().subscribe(data => {
      this.availableBookings.set(data.filter(b => b.status === 'In Transit' || b.status === 'Pending'));
    });
    // Load drivers
    this.masterService.getStaff().subscribe(data => {
      this.drivers.set(data.filter(s => s.designation === 'Driver'));
    });
    this.isLoading.set(false);
  }

  toggleSelection(id: number) {
    if (this.selectedBookings.has(id)) {
      this.selectedBookings.delete(id);
    } else {
      this.selectedBookings.add(id);
    }
  }

  onSubmit() {
    if (this.ofdForm.valid && this.selectedBookings.size > 0) {
      const payload = {
        booking_ids: Array.from(this.selectedBookings),
        staff_id: this.ofdForm.value.staff_id,
        vehicle_no: this.ofdForm.value.vehicle_no
      };

      this.deliveryService.assignOFD(payload).subscribe(() => {
        this.loadData();
        this.selectedBookings.clear();
        this.ofdForm.reset();
        alert('OFD Assigned successfully!');
      });
    }
  }
}
