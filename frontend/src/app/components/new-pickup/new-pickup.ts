import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PickupService } from '../../services/pickup.service';
import { Pickup } from '../../models/pickup.model';

@Component({
  selector: 'app-new-pickup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-pickup.html',
  styleUrl: './new-pickup.css',
})
export class NewPickup implements OnInit {
  private pickupService = inject(PickupService);

  pickups = signal<Pickup[]>([]);
  searchText = signal('');
  fromDate = signal('');
  toDate = signal('');
  isLoading = signal(true);

  paidCount = computed(() => this.pickups().filter(p => p.payment_status === 'Paid').length);
  unpaidCount = computed(() => this.pickups().filter(p => p.payment_status === 'Unpaid').length);
  partPaidCount = computed(() => this.pickups().filter(p => p.payment_status === 'Part Paid').length);

  filteredPickups = computed(() => {
    let result = this.pickups();
    const text = this.searchText().toLowerCase();
    
    if (text) {
      result = result.filter(p => 
        p.client_name.toLowerCase().includes(text) || 
        p.consignment_no.toLowerCase().includes(text) ||
        p.sender_details?.toLowerCase().includes(text) ||
        p.receiver_details?.toLowerCase().includes(text)
      );
    }
    
    return result;
  });

  ngOnInit() {
    this.loadPickups();
  }

  loadPickups() {
    this.isLoading.set(true);
    this.pickupService.getAllPickups().subscribe({
      next: (data) => {
        this.pickups.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  updateStatus(id: number | undefined, status: string) {
    if (!id) return;
    this.pickupService.updatePickup(id, { pickup_status: status }).subscribe(() => {
      this.loadPickups();
    });
  }

  assignBranch(id: number | undefined, branch: string) {
    if (!id || !branch) return;
    this.pickupService.updatePickup(id, { assign_branch: branch, pickup_status: 'Assigned' }).subscribe(() => {
      this.loadPickups();
    });
  }

  getStatusClass(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'pending': return 'badge bg-warning text-dark';
      case 'accepted': return 'badge bg-info';
      case 'assigned': return 'badge bg-primary';
      case 'rejected': return 'badge bg-danger';
      case 'completed': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  }
}
