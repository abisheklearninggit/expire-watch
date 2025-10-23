export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  manufacturingDate?: Date;
  expiryDate: Date;
  addedDate: Date;
  category?: string;
  notes?: string;
}

export type ExpiryStatus = 'fresh' | 'expiring-soon' | 'expired';

export interface ReminderSettings {
  enabled: boolean;
  daysBeforeExpiry: number;
}
