import { useState, useEffect } from 'react';
import { Plus, Scan, ListFilter, Search, Package, Bell, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AuthForm } from '@/components/AuthForm';
import { ReminderSettings } from '@/components/ReminderSettings';
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

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'fresh' | 'expiring-soon' | 'expired'>('all');
  
  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Load products from database
  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('expiry_date', { ascending: true });

      if (error) throw error;

      const productsWithDates = (data || []).map((p: any) => ({
        ...p,
        addedDate: new Date(p.added_date),
        expiryDate: new Date(p.expiry_date),
        manufacturingDate: p.manufacturing_date ? new Date(p.manufacturing_date) : undefined,
      }));

      setProducts(productsWithDates);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    }
  };
  
  const handleProductScanned = async (product: Omit<Product, 'id' | 'addedDate'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('products').insert({
        user_id: user.id,
        name: product.name,
        image_url: product.imageUrl,
        manufacturing_date: product.manufacturingDate?.toISOString(),
        expiry_date: product.expiryDate.toISOString(),
        category: product.category,
        notes: product.notes,
      });

      if (error) throw error;

      // Schedule notification for this product
      const { data: settings } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settings?.enabled) {
        const { scheduleExpiryNotification } = await import('@/utils/notifications');
        await scheduleExpiryNotification(
          product.name,
          product.expiryDate,
          settings.days_before_expiry
        );
      }

      await loadProducts();
      setShowScanner(false);
      toast.success('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };
  
  const handleManualEntry = async (product: Omit<Product, 'id' | 'addedDate'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('products').insert({
        user_id: user.id,
        name: product.name,
        image_url: product.imageUrl,
        manufacturing_date: product.manufacturingDate?.toISOString(),
        expiry_date: product.expiryDate.toISOString(),
        category: product.category,
        notes: product.notes,
      });

      if (error) throw error;

      // Schedule notification for this product
      const { data: settings } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settings?.enabled) {
        const { scheduleExpiryNotification } = await import('@/utils/notifications');
        await scheduleExpiryNotification(
          product.name,
          product.expiryDate,
          settings.days_before_expiry
        );
      }

      await loadProducts();
      setShowManualEntry(false);
      toast.success('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };
  
  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      await loadProducts();
      toast.success('Product deleted');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
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
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

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
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowReminderSettings(true)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Bell className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {showReminderSettings && (
        <ReminderSettings onClose={() => setShowReminderSettings(false)} />
      )}
      
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
