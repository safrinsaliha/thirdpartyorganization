import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService, Hub } from '../../services/master.service';

@Component({
  selector: 'app-hub-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './hub-master.html',
  styleUrl: '../master/branch-master.css'
})
export class HubMaster {
  private masterService = inject(MasterService);
  private fb = inject(FormBuilder);

  hubs = signal<Hub[]>([]);
  isLoading = signal(false);

  hubForm = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    location: ['', Validators.required],
    manager_name: ['']
  });

  ngOnInit() {
    this.loadHubs();
  }

  loadHubs() {
    this.isLoading.set(true);
    this.masterService.getHubs().subscribe({
      next: (data) => {
        this.hubs.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSubmit() {
    if (this.hubForm.valid) {
      this.masterService.createHub(this.hubForm.value as Hub).subscribe(() => {
        this.loadHubs();
        this.hubForm.reset();
      });
    }
  }
}
