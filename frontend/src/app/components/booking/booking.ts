import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class Booking implements OnInit {
  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);
  today = new Date();

  bookingForm = this.fb.group({
    manual_auto_cd: ['Auto', [Validators.required]],
    consignment_no: [`CN-${Math.floor(Math.random() * 900000) + 100000}`, [Validators.required]],
    customer_name: ['', [Validators.required]],
    origin: ['', [Validators.required]],
    destination: ['', [Validators.required]],
    service_type: ['Surface', [Validators.required]],
    pincode: ['', [Validators.required]],
    booking_date: [new Date(), [Validators.required]],
    
    consignor: this.fb.group({
      name: ['', [Validators.required]],
      city: ['', [Validators.required]],
      address: ['', [Validators.required]],
      mobile: ['', [Validators.required]],
      pincode: ['', [Validators.required]],
      state: ['', [Validators.required]]
    }),
    
    consignee: this.fb.group({
      name: ['', [Validators.required]],
      city: ['', [Validators.required]],
      address: ['', [Validators.required]],
      mobile: ['', [Validators.required]],
      state: ['', [Validators.required]]
    }),

    shipment: this.fb.group({
      total_pcs: [1, [Validators.required, Validators.min(1)]],
      actual_weight: [0, [Validators.required, Validators.min(0.1)]],
      volumetric_weight: [0],
      chargeable_weight: [0],
      invoice_value: [0],
      invoice_number: [''],
      eway_bill_no: [''],
      product_category: ['Electronics']
    }),
    
    billing: this.fb.group({
      payment_mode: ['CASH', [Validators.required]],
      rate_per_kg: [10, [Validators.required, Validators.min(1)]],
      freight_amt: [0],
      fsc_amt: [0],
      other_charges: [0],
      cgst: [0],
      sgst: [0],
      igst: [0],
      net_total: [0]
    }),

    info: this.fb.group({
      company_name: ['KB Cargo'],
      doc_type: ['CN'],
      delivery_type: ['Standard'],
      billing_branch: ['Main'],
      freight_charge_by: ['Weight'],
      invoice_currency: ['INR'],
      booked_by: ['Admin'],
      staff_name: ['']
    })
  });

  isLoading = signal(false);
  message = signal<{ type: 'success' | 'error', text: string } | null>(null);

  ngOnInit() {
    this.setupCalculations();
  }

  setupCalculations() {
    // Watch weight and rate for billing
    this.bookingForm.get('shipment.actual_weight')?.valueChanges.subscribe(() => this.calculateBilling());
    this.bookingForm.get('shipment.volumetric_weight')?.valueChanges.subscribe(() => this.calculateBilling());
    this.bookingForm.get('billing.rate_per_kg')?.valueChanges.subscribe(() => this.calculateBilling());
  }

  calculateBilling() {
    const actual = this.bookingForm.get('shipment.actual_weight')?.value || 0;
    const vol = this.bookingForm.get('shipment.volumetric_weight')?.value || 0;
    const rate = this.bookingForm.get('billing.rate_per_kg')?.value || 0;

    const chargeable = Math.max(actual, vol);
    this.bookingForm.get('shipment.chargeable_weight')?.setValue(chargeable, { emitEvent: false });

    const freight = chargeable * rate;
    const fsc = freight * 0.1; // 10% Fuel Surcharge
    const cgst = freight * 0.09; // 9% CGST
    const sgst = freight * 0.09; // 9% SGST
    const net = freight + fsc + cgst + sgst;

    this.bookingForm.patchValue({
      billing: {
        freight_amt: freight,
        fsc_amt: fsc,
        cgst: Number(cgst.toFixed(2)),
        sgst: Number(sgst.toFixed(2)),
        net_total: Number(net.toFixed(2))
      }
    }, { emitEvent: false });
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      this.isLoading.set(true);
      this.bookingService.createBooking(this.bookingForm.value as any).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.message.set({ type: 'success', text: 'Consignment booked successfully!' });
          this.resetForm();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.message.set({ type: 'error', text: err.error?.message || 'Failed to book consignment.' });
        }
      });
    }
  }

  resetForm() {
    this.bookingForm.reset({
      manual_auto_cd: 'Auto',
      consignment_no: `CN-${Math.floor(Math.random() * 900000) + 100000}`,
      service_type: 'Surface',
      booking_date: new Date(),
      consignor: { name: '', city: '', address: '', mobile: '', pincode: '', state: '' },
      consignee: { name: '', city: '', address: '', mobile: '', state: '' },
      shipment: { total_pcs: 1, actual_weight: 0, volumetric_weight: 0, chargeable_weight: 0, invoice_value: 0, invoice_number: '', eway_bill_no: '', product_category: 'Electronics' },
      billing: { payment_mode: 'CASH', rate_per_kg: 10, freight_amt: 0, fsc_amt: 0, other_charges: 0, cgst: 0, sgst: 0, igst: 0, net_total: 0 },
      info: { company_name: 'KB Cargo', doc_type: 'CN', delivery_type: 'Standard', billing_branch: 'Main', freight_charge_by: 'Weight', invoice_currency: 'INR', booked_by: 'Admin', staff_name: '' }
    });
  }
}
