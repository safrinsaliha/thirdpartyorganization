import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService, Staff, Branch, Hub } from '../../services/master.service';

@Component({
  selector: 'app-staff-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './staff-master.html',
  styleUrl: '../master/branch-master.css'
})
export class StaffMaster {
  private masterService = inject(MasterService);
  private fb = inject(FormBuilder);

  staffList = signal<Staff[]>([]);
  branches = signal<Branch[]>([]);
  hubs = signal<Hub[]>([]);
  isLoading = signal(false);

  staffForm = this.fb.group({
    name: ['', Validators.required],
    employee_id: ['', Validators.required],
    designation: ['', Validators.required],
    mobile: ['', Validators.required],
    branch_id: [null],
    hub_id: [null]
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.masterService.getStaff().subscribe(data => this.staffList.set(data));
    this.masterService.getBranches().subscribe(data => this.branches.set(data));
    this.masterService.getHubs().subscribe(data => this.hubs.set(data));
    this.isLoading.set(false);
  }

  onSubmit() {
    if (this.staffForm.valid) {
      this.masterService.createStaff(this.staffForm.value as any).subscribe(() => {
        this.loadData();
        this.staffForm.reset();
      });
    }
  }

  getStoreName(s: Staff) {
    if (s.branch_id) return this.branches().find(b => b.id === s.branch_id)?.name;
    if (s.hub_id) return this.hubs().find(h => h.id === s.hub_id)?.name;
    return 'N/A';
  }
}
