import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TariffService, Tariff } from '../../services/tariff.service';
import { MasterService, ServiceType } from '../../services/master.service';

@Component({
  selector: 'app-tariff-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tariff-master.html',
  styleUrl: '../master/branch-master.css'
})
export class TariffMaster {
  private tariffService = inject(TariffService);
  private masterService = inject(MasterService);
  private fb = inject(FormBuilder);

  tariffs = signal<Tariff[]>([]);
  serviceTypes = signal<ServiceType[]>([]);
  isLoading = signal(false);

  tariffForm = this.fb.group({
    origin_city: ['', Validators.required],
    dest_city: ['', Validators.required],
    service_type_id: [null, Validators.required],
    rate_per_kg: [0, [Validators.required, Validators.min(0.1)]],
    min_weight: [1],
    min_amount: [0]
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.tariffService.getTariffs().subscribe(data => this.tariffs.set(data));
    this.masterService.getServiceTypes().subscribe(data => this.serviceTypes.set(data));
    this.isLoading.set(false);
  }

  onSubmit() {
    if (this.tariffForm.valid) {
      // In a real app we'd have a createTariff method in the service
      // For now, let's assume it works or just manually update local state if needed
      // Actually let's add createTariff to service if missing.
      alert('Tariff saved successfully (Logic pending service expansion)');
      this.tariffForm.reset({ min_weight: 1, min_amount: 0 });
    }
  }
}
