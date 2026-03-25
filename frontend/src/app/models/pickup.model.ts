export interface Pickup {
  id?: number;
  consignment_no: string;
  client_name: string;
  payment_status: string; // Paid, Unpaid, Part Paid
  pickup_status: string;  // Pending, Accepted, Assigned, Rejected, Completed
  sender_details?: string;
  receiver_details?: string;
  pcs_weight?: string;
  assign_branch?: string;
  delivery_status?: string;
  pickup_staff?: string;
  created_at?: string;
}
