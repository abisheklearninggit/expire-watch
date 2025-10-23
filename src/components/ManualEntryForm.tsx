import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Product } from '@/types/product';

interface ManualEntryFormProps {
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id' | 'addedDate'>) => void;
}

export function ManualEntryForm({ onClose, onSubmit }: ManualEntryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    expiryDate: '',
    manufacturingDate: '',
    notes: '',
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.expiryDate) {
      return;
    }
    
    const product: Omit<Product, 'id' | 'addedDate'> = {
      name: formData.name,
      imageUrl: 'https://images.unsplash.com/photo-1586380875411-508d05a06069?w=400',
      expiryDate: new Date(formData.expiryDate),
      manufacturingDate: formData.manufacturingDate ? new Date(formData.manufacturingDate) : undefined,
      category: formData.category || undefined,
      notes: formData.notes || undefined,
    };
    
    onSubmit(product);
  };
  
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">Add Product Manually</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4">
        <Card className="p-6 space-y-6 max-w-2xl mx-auto">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              required
              placeholder="e.g., Organic Milk"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12 text-base"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., Dairy, Snacks"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="h-12 text-base"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mfg-date">Manufacturing Date</Label>
              <Input
                id="mfg-date"
                type="date"
                value={formData.manufacturingDate}
                onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                className="h-12 text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exp-date">Expiry Date *</Label>
              <Input
                id="exp-date"
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="h-12 text-base"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional information about the product..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="text-base"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-12">
              Add Product
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
