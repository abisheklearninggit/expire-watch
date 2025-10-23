import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Bell, Loader2, X } from 'lucide-react';

interface ReminderSettingsProps {
  onClose: () => void;
}

export function ReminderSettings({ onClose }: ReminderSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [daysBeforeExpiry, setDaysBeforeExpiry] = useState(7);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setEnabled(data.enabled);
        setDaysBeforeExpiry(data.days_before_expiry);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load reminder settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reminder_settings')
        .upsert({
          user_id: user.id,
          enabled,
          days_before_expiry: daysBeforeExpiry,
        });

      if (error) throw error;

      toast.success('Reminder settings saved!');
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6 animate-scale-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Reminder Settings</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="enabled" className="text-base font-medium">
                Enable Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified about expiring products
              </p>
            </div>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="days" className="text-base font-medium">
              Remind me before
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="days"
                type="number"
                min="1"
                max="30"
                value={daysBeforeExpiry}
                onChange={(e) => setDaysBeforeExpiry(parseInt(e.target.value) || 7)}
                className="h-12 text-base"
                disabled={!enabled}
              />
              <span className="text-muted-foreground whitespace-nowrap">days</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You'll be notified when products are about to expire
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-12"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
