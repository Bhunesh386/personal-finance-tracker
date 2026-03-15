import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import useStore from '../store/useStore';
import { supabase } from '../lib/supabase';
import { User, Palette, Bell, Shield, Database, Info, Sun, Moon, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'about', label: 'About', icon: Info },
];

export default function Settings() {
  const [active, setActive] = useState('profile');
  const { user, profile, updatePassword, fetchProfile } = useAuth();
  const { theme, setTheme } = useStore();

  // Profile
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [currency, setCurrency] = useState(profile?.currency || 'INR');
  const [timezone, setTimezone] = useState(profile?.timezone || 'Asia/Kolkata');
  const [saving, setSaving] = useState(false);

  // Security
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  // Data
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ full_name: fullName, currency, timezone, updated_at: new Date().toISOString() }).eq('id', user.id);
      if (error) throw error;
      await fetchProfile(user.id);
      toast.success('Profile updated!');
    } catch (e) { toast.error('Failed to update profile'); }
    setSaving(false);
  };

  const changePassword = async () => {
    if (newPwd !== confirmPwd) { toast.error('Passwords do not match'); return; }
    if (newPwd.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    try {
      await updatePassword(newPwd);
      toast.success('Password updated!');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (e) { toast.error(e.message || 'Failed to update password'); }
  };

  const deleteAllData = async () => {
    if (deleteConfirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    try {
      const tables = ['watchlist', 'portfolio', 'budgets', 'transactions', 'categories'];
      for (const table of tables) {
        await supabase.from(table).delete().eq('user_id', user.id);
      }
      toast.success('All data deleted');
      setDeleteConfirm('');
    } catch (e) { toast.error('Failed to delete data'); }
  };

  const exportTransactions = async () => {
    try {
      const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id);
      const csv = ['Date,Description,Type,Amount,Merchant,Payment Method,Notes',
        ...(data || []).map(t => `${t.date},"${t.description}",${t.type},${t.amount},"${t.merchant || ''}",${t.payment_method || ''},"${t.notes || ''}"`)
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
      link.download = 'transactions.csv'; link.click();
      toast.success('Exported!');
    } catch (e) { toast.error('Export failed'); }
  };

  return (
    <div className="flex gap-6">
      {/* Nav */}
      <div className="w-[200px] shrink-0 sticky top-20 self-start">
        <nav className="space-y-1">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${active === s.id ? 'bg-primary/10 text-primary font-medium' : 'text-light-muted dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-card'}`}>
              <s.icon className="w-4 h-4" />{s.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl space-y-6">
        {active === 'profile' && (
          <Card>
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">Profile</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                {fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div><p className="text-sm font-medium text-light-text dark:text-dark-text">{fullName || 'User'}</p>
                <p className="text-xs text-light-muted dark:text-dark-muted">{user?.email}</p></div>
            </div>
            <div className="space-y-4">
              <Input label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
              <Input label="Email" value={user?.email || ''} disabled />
              <div><label className="block text-sm font-medium text-light-muted dark:text-dark-muted mb-1.5">Currency</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="INR">₹ INR</option><option value="USD">$ USD</option><option value="EUR">€ EUR</option><option value="GBP">£ GBP</option>
                </select></div>
              <Input label="Timezone" value={timezone} onChange={e => setTimezone(e.target.value)} />
              <Button onClick={saveProfile} loading={saving}>Save Changes</Button>
            </div>
          </Card>
        )}

        {active === 'appearance' && (
          <Card>
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">Appearance</h3>
            <div className="grid grid-cols-3 gap-4">
              {[{ id: 'light', label: 'Light', icon: Sun, bg: 'bg-white border-light-border' },
                { id: 'dark', label: 'Dark', icon: Moon, bg: 'bg-dark-bg border-dark-border' },
                { id: 'system', label: 'System', icon: Monitor, bg: 'bg-gradient-to-r from-white to-dark-bg' }].map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${theme === t.id ? 'border-primary bg-primary/5' : 'border-light-border dark:border-dark-border hover:border-primary/30'}`}>
                  <t.icon className="w-6 h-6 text-light-text dark:text-dark-text" /><span className="text-sm font-medium text-light-text dark:text-dark-text">{t.label}</span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {active === 'notifications' && (
          <Card>
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">Notifications</h3>
            {[{ label: 'Budget alerts (>80% spent)', id: 'budget' },
              { label: 'Portfolio alerts (>5% change)', id: 'portfolio' },
              { label: 'Weekly email summary', id: 'weekly' }].map(n => (
              <div key={n.id} className="flex items-center justify-between py-3 border-b border-light-border dark:border-dark-border last:border-0">
                <span className="text-sm text-light-text dark:text-dark-text">{n.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer dark:bg-dark-border peer-checked:bg-primary transition-colors" />
                </label>
              </div>
            ))}
          </Card>
        )}

        {active === 'security' && (
          <Card>
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">Change Password</h3>
            <div className="space-y-4">
              <Input label="Current Password" type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
              <Input label="New Password" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
              <Input label="Confirm New Password" type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
              <Button onClick={changePassword}>Update Password</Button>
            </div>
          </Card>
        )}

        {active === 'data' && (
          <div className="space-y-4">
            <Card>
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">Export Data</h3>
              <div className="flex gap-3">
                <Button variant="outline" onClick={exportTransactions}>Export Transactions (CSV)</Button>
                <Button variant="outline" onClick={() => toast.success('Coming soon')}>Export Portfolio (CSV)</Button>
              </div>
            </Card>
            <Card className="border-negative/30">
              <h3 className="text-lg font-semibold text-negative mb-2">Danger Zone</h3>
              <p className="text-sm text-light-muted dark:text-dark-muted mb-4">Delete all your data permanently. This cannot be undone. Type <strong>DELETE</strong> to confirm.</p>
              <div className="flex gap-3">
                <Input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder='Type "DELETE"' />
                <Button variant="danger" onClick={deleteAllData} disabled={deleteConfirm !== 'DELETE'}>Delete All Data</Button>
              </div>
            </Card>
          </div>
        )}

        {active === 'about' && (
          <Card>
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">About</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-light-muted dark:text-dark-muted">Version</span><span className="text-light-text dark:text-dark-text font-medium">1.0.0</span></div>
              <div className="flex justify-between"><span className="text-light-muted dark:text-dark-muted">App Name</span><span className="text-light-text dark:text-dark-text font-medium">Financial Tracker</span></div>
              <p className="text-light-muted dark:text-dark-muted pt-2">Your money. Your markets. One place.</p>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => window.open('mailto:feedback@example.com')}>Send Feedback</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
