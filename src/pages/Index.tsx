import { useState, useEffect } from 'react';
import { Plus, Scan, ListFilter, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/ProductCard';
import { ScannerView } from '@/components/ScannerView';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import { Product } from '@/types/product';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getExpiryStatus } from '@/utils/dateParser';

const STORAGE_KEY = 'expiry-tracker-products';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'fresh' | 'expiring-soon' | 'expired'>('all');
  
  // Load products from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      const productsWithDates = parsed.map((p: any) => ({
        ...p,
        addedDate: new Date(p.addedDate),
        expiryDate: new Date(p.expiryDate),
        manufacturingDate: p.manufacturingDate ? new Date(p.manufacturingDate) : undefined,
      }));
      setProducts(productsWithDates);
    }
  }, []);
  
  // Save products to localStorage
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  }, [products]);
  
  const handleProductScanned = (product: Omit<Product, 'id' | 'addedDate'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      addedDate: new Date(),
    };
    
    setProducts((prev) => [newProduct, ...prev]);
    setShowScanner(false);
    toast.success('Product added successfully!');
  };
  
  const handleManualEntry = (product: Omit<Product, 'id' | 'addedDate'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      addedDate: new Date(),
    };
    
    setProducts((prev) => [newProduct, ...prev]);
    setShowManualEntry(false);
    toast.success('Product added successfully!');
  };
  
  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success('Product deleted');
  };
  
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getExpiryStatus(product.expiryDate);
    const matchesFilter = filterStatus === 'all' || status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });
  
  const stats = {
    fresh: products.filter((p) => getExpiryStatus(p.expiryDate) === 'fresh').length,
    expiringSoon: products.filter((p) => getExpiryStatus(p.expiryDate) === 'expiring-soon').length,
    expired: products.filter((p) => getExpiryStatus(p.expiryDate) === 'expired').length,
  };
  
  if (showScanner) {
    return <ScannerView onClose={() => setShowScanner(false)} onProductScanned={handleProductScanned} />;
  }
  
  if (showManualEntry) {
    return <ManualEntryForm onClose={() => setShowManualEntry(false)} onSubmit={handleManualEntry} />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8" />
              <h1 className="text-2xl font-bold">FreshTrack</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-success">{stats.fresh}</div>
            <div className="text-sm text-success font-medium mt-1">Fresh</div>
          </div>
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-warning">{stats.expiringSoon}</div>
            <div className="text-sm text-warning font-medium mt-1">Expiring</div>
          </div>
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-destructive">{stats.expired}</div>
            <div className="text-sm text-destructive font-medium mt-1">Expired</div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            size="lg"
            className="h-16 text-lg font-semibold"
            onClick={() => setShowScanner(true)}
          >
            <Scan className="w-6 h-6 mr-2" />
            Scan Product
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-16 text-lg font-semibold"
            onClick={() => setShowManualEntry(true)}
          >
            <Plus className="w-6 h-6 mr-2" />
            Add Manually
          </Button>
        </div>
        
        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-40 h-12">
              <ListFilter className="w-5 h-5 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="fresh">Fresh</SelectItem>
              <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Package className="w-20 h-20 mx-auto text-muted-foreground/50" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No products yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery || filterStatus !== 'all'
                  ? 'No products match your search or filter'
                  : 'Start by scanning or adding products to track their expiry dates'}
              </p>
            </div>
            {!searchQuery && filterStatus === 'all' && (
              <Button size="lg" onClick={() => setShowScanner(true)}>
                <Scan className="w-5 h-5 mr-2" />
                Scan Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={handleDeleteProduct}
                onClick={(p) => toast.info(`Viewing ${p.name}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
