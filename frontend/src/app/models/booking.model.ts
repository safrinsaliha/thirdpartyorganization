export interface ShipmentDetail {
  id?: number;
  booking_id?: number;
  total_pcs: number;
  actual_weight: number;
  volumetric_weight: number;
  chargeable_weight: number;
}

export interface BillingDetail {
  id?: number;
  booking_id?: number;
  payment_mode: string;
  rate_per_kg: number;
  freight_amt: number;
  fsc_amt: number;
  cgst: number;
  sgst: number;
  igst: number;
  net_total: number;
}

export interface Booking {
  id?: number;
  consignment_no: string;
  customer_name: string;
  origin: string;
  destination: string;
  service_type: string;
  pincode: string;
  booking_date?: string;
  invoice_number?: string;
  invoice_value?: number;
  product_category?: string;
  consignee_name?: string;
  consignee_mobile?: string;
  status?: string;
  shipment?: ShipmentDetail;
  billing?: BillingDetail;
}
