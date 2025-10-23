import { format, differenceInDays } from 'date-fns';
import { Calendar, Clock, Trash2 } from 'lucide-react';
import { Product, ExpiryStatus } from '@/types/product';
import { getExpiryStatus } from '@/utils/dateParser';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onClick: (product: Product) => void;
}

export function ProductCard({ product, onDelete, onClick }: ProductCardProps) {
  const status = getExpiryStatus(product.expiryDate);
  const daysUntilExpiry = differenceInDays(product.expiryDate, new Date());
  
  const statusConfig: Record<ExpiryStatus, { bg: string; text: string; badge: string }> = {
    fresh: {
      bg: 'bg-success/10',
      text: 'text-success',
      badge: 'Fresh',
    },
    'expiring-soon': {
      bg: 'bg-warning/10',
      text: 'text-warning',
      badge: 'Expiring Soon',
    },
    expired: {
      bg: 'bg-destructive/10',
      text: 'text-destructive',
      badge: 'Expired',
    },
  };
  
  const config = statusConfig[status];
  
  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg"
      onClick={() => onClick(product)}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="object-cover w-full h-full"
        />
        <div className={cn('absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-semibold', config.bg, config.text)}>
          {config.badge}
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
          {product.category && (
            <p className="text-sm text-muted-foreground">{product.category}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Expires:</span>
            <span className="font-medium">{format(product.expiryDate, 'MMM dd, yyyy')}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className={cn('font-medium', config.text)}>
              {status === 'expired'
                ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                : `${daysUntilExpiry} days left`}
            </span>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(product.id);
          }}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </Card>
  );
}
