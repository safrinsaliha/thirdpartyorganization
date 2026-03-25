import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService, Branch } from '../../services/master.service';

@Component({
  selector: 'app-branch-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './branch-master.html',
  styleUrl: './branch-master.css'
})
export class BranchMaster {
  private masterService = inject(MasterService);
  private fb = inject(FormBuilder);

  branches = signal<Branch[]>([]);
  isLoading = signal(false);

  branchForm = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    city: ['', Validators.required],
    address: [''],
    contact_no: ['']
  });

  ngOnInit() {
    this.loadBranches();
  }

  loadBranches() {
    this.isLoading.set(true);
    this.masterService.getBranches().subscribe({
      next: (data) => {
        this.branches.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSubmit() {
    if (this.branchForm.valid) {
      this.masterService.createBranch(this.branchForm.value as Branch).subscribe(() => {
        this.loadBranches();
        this.branchForm.reset();
      });
    }
  }
}
