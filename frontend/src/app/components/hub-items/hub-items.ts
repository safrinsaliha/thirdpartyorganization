import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../../services/delivery.service';

@Component({
  selector: 'app-hub-items',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hub-items.html',
  styleUrl: './hub-items.css',
})
export class HubItems implements OnInit {
  private deliveryService = inject(DeliveryService);

  items = signal<any[]>([]);
  searchText = signal('');
  fromDate = signal('');
  toDate = signal('');
  isLoading = signal(true);

  filteredItems = computed(() => {
    let result = this.items();
    const text = this.searchText().toLowerCase();
    
    if (text) {
      result = result.filter(item => 
        item.client_name?.toLowerCase().includes(text) || 
        item.invoice_no?.toLowerCase().includes(text) ||
        item.origin_hub?.toLowerCase().includes(text) ||
        item.destination_name?.toLowerCase().includes(text)
      );
    }
    
    return result;
  });

  ngOnInit() {
    this.loadHubItems();
  }

  loadHubItems() {
    this.isLoading.set(true);
    this.deliveryService.getHubItems().subscribe({
      next: (data) => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  assignStaff(id: number, staffName: string) {
    // In a real app, this would be a PUT request
    console.log(`Assigning ${staffName} to hub item ${id}`);
    this.items.update(prev => prev.map(item => 
      item.id === id ? { ...item, employee_name: staffName, status: 'Staff Assigned' } : item
    ));
  }

  getStatusClass(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'received': return 'badge bg-info';
      case 'staff assigned': return 'badge bg-primary';
      case 'in transit': return 'badge bg-warning text-dark';
      case 'delivered': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  }
}
