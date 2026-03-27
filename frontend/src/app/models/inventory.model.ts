export interface InventoryItem {
  id?: number;
  name: string;
  category: string;
  quantity: number;
  location: string;
  status: string;
  created_at?: string;
}
