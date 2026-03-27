import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { InventoryItem } from '../../models/inventory.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css'
})
export class InventoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private inventoryService = inject(InventoryService);

  inventoryItems = signal<InventoryItem[]>([]);
  isLoading = signal(false);
  showAddForm = signal(false);

  inventoryForm = this.fb.group({
    name: ['', [Validators.required]],
    category: ['General', [Validators.required]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    location: ['Main Warehouse', [Validators.required]],
    status: ['In Stock', [Validators.required]]
  });

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.isLoading.set(true);
    this.inventoryService.getInventory().subscribe({
      next: (items) => {
        this.inventoryItems.set(items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSubmit() {
    if (this.inventoryForm.valid) {
      this.isLoading.set(true);
      const newItem = this.inventoryForm.value as InventoryItem;
      this.inventoryService.addItem(newItem).subscribe({
        next: () => {
          this.loadInventory();
          this.inventoryForm.reset({
            category: 'General',
            quantity: 0,
            location: 'Main Warehouse',
            status: 'In Stock'
          });
          this.showAddForm.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  toggleAddForm() {
    this.showAddForm.update(v => !v);
  }
}
