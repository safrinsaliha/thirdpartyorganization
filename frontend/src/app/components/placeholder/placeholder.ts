import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-5 text-center">
      <i class="bi bi-tools display-1 text-muted mb-4"></i>
      <h3>Module Under Development</h3>
      <p class="text-muted">This logistics module is currently being optimized for high-performance operations.</p>
      <button class="btn btn-primary mt-3" onclick="history.back()">Go Back</button>
    </div>
  `
})
export class Placeholder {}
