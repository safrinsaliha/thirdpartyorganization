import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BranchMaster } from './branch-master';
import { HubMaster } from './hub-master';
import { StaffMaster } from './staff-master';

@Component({
  selector: 'app-master',
  standalone: true,
  imports: [CommonModule, BranchMaster, HubMaster, StaffMaster],
  template: `
    <div class="master-container">
      <div class="tabs-header glass-card mx-4 mt-4 p-2 d-flex gap-2">
        <button class="tab-btn" [class.active]="activeTab() === 'branch'" (click)="activeTab.set('branch')">
          <i class="bi bi-building me-2"></i>Branches
        </button>
        <button class="tab-btn" [class.active]="activeTab() === 'hub'" (click)="activeTab.set('hub')">
          <i class="bi bi-hub me-2"></i>Hubs
        </button>
        <button class="tab-btn" [class.active]="activeTab() === 'staff'" (click)="activeTab.set('staff')">
          <i class="bi bi-people me-2"></i>Staff
        </button>
      </div>

      <div class="tab-content">
        @if (activeTab() === 'branch') { <app-branch-master /> }
        @if (activeTab() === 'hub') { <app-hub-master /> }
        @if (activeTab() === 'staff') { <app-staff-master /> }
      </div>
    </div>
  `,
  styles: [`
    .master-container { min-height: 100vh; background: var(--dark-bg); }
    .tabs-header { background: rgba(255, 255, 255, 0.03); border-radius: 12px; }
    .tab-btn {
      padding: 10px 24px;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.6);
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    .tab-btn:hover { color: white; background: rgba(255, 255, 255, 0.05); }
    .tab-btn.active {
      color: white;
      background: var(--primary-color);
      box-shadow: 0 4px 15px rgba(67, 97, 238, 0.3);
    }
  `]
})
export class Master {
  activeTab = signal('branch');
}
