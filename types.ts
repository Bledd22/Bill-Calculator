export interface ReceiptData {
  subtotal: number;
  tax: number;
  total: number;
  currency?: string;
  items?: Array<{ name: string; price: number }>;
}

export enum TipType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED'
}

export interface BillState {
  billAmount: number;
  tipType: TipType;
  tipValue: number;
  splitCount: number;
  taxAmount: number; // For detailed breakdown
  includeTaxInTip: boolean;
}
