import React, { useState, useEffect } from 'react';
import Drawer from '../ui/Drawer';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { PAYMENT_METHODS } from '../../lib/utils';
import { format } from 'date-fns';

const transactionTypes = [
  { value: 'expense', label: 'Expense', color: 'bg-negative' },
  { value: 'income', label: 'Income', color: 'bg-positive' },
  { value: 'transfer', label: 'Transfer', color: 'bg-primary' },
];

export default function AddTransactionDrawer({
  isOpen,
  onClose,
  onSave,
  editTransaction = null,
  categories = [],
}) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    merchant: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'upi',
    category_id: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  // Pre-fill when editing
  useEffect(() => {
    if (editTransaction) {
      setFormData({
        type: editTransaction.type || 'expense',
        amount: editTransaction.amount?.toString() || '',
        description: editTransaction.description || '',
        merchant: editTransaction.merchant || '',
        date: editTransaction.date || format(new Date(), 'yyyy-MM-dd'),
        payment_method: editTransaction.payment_method || 'upi',
        category_id: editTransaction.category_id || '',
        notes: editTransaction.notes || '',
      });
    } else {
      setFormData({
        type: 'expense',
        amount: '',
        description: '',
        merchant: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: 'upi',
        category_id: '',
        notes: '',
      });
    }
  }, [editTransaction, isOpen]);

  const filteredCategories = categories.filter(c => {
    if (formData.type === 'expense') return c.type === 'expense' || c.type === 'both';
    if (formData.type === 'income') return c.type === 'income' || c.type === 'both';
    return true;
  });

  const handleSubmit = async () => {
    if (!formData.amount || !formData.description) return;
    setLoading(true);
    try {
      await onSave({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      onClose();
    } catch (err) {
      console.error('Error saving transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={editTransaction ? 'Edit Transaction' : 'Add Transaction'}
    >
      <div className="space-y-5">
        {/* Type toggle */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-dark-border rounded-lg">
          {transactionTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setFormData(f => ({ ...f, type: t.value }))}
              className={`
                flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer
                ${formData.type === t.value
                  ? `${t.color} text-white`
                  : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                }
              `}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-light-muted dark:text-dark-muted mb-1.5">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-medium text-light-muted dark:text-dark-muted">₹</span>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              className="w-full pl-8 pr-3 py-3 text-2xl font-bold rounded-lg border border-light-border dark:border-dark-border
                bg-white dark:bg-dark-bg text-light-text dark:text-dark-text
                focus:outline-none focus:ring-2 focus:ring-primary/50 text-center"
            />
          </div>
        </div>

        {/* Category grid */}
        <div>
          <label className="block text-sm font-medium text-light-muted dark:text-dark-muted mb-2">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFormData(f => ({ ...f, category_id: cat.id }))}
                className={`
                  flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all cursor-pointer
                  ${formData.category_id === cat.id
                    ? 'border-primary bg-primary/5'
                    : 'border-light-border dark:border-dark-border hover:border-primary/30'
                  }
                `}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-xs text-light-text dark:text-dark-text truncate w-full text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
          placeholder="What was this for?"
          required
        />

        {/* Merchant */}
        <Input
          label="Merchant"
          value={formData.merchant}
          onChange={(e) => setFormData(f => ({ ...f, merchant: e.target.value }))}
          placeholder="Where did you pay? (optional)"
        />

        {/* Date */}
        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(f => ({ ...f, date: e.target.value }))}
        />

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-light-muted dark:text-dark-muted mb-1.5">
            Payment Method
          </label>
          <select
            value={formData.payment_method}
            onChange={(e) => setFormData(f => ({ ...f, payment_method: e.target.value }))}
            className="w-full rounded-lg border border-light-border dark:border-dark-border
              bg-white dark:bg-dark-card text-light-text dark:text-dark-text
              px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {Object.entries(PAYMENT_METHODS).map(([key, { label, icon }]) => (
              <option key={key} value={key}>{icon} {label}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-light-muted dark:text-dark-muted mb-1.5">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
            placeholder="Any additional notes... (optional)"
            rows={3}
            className="w-full rounded-lg border border-light-border dark:border-dark-border
              bg-white dark:bg-dark-card text-light-text dark:text-dark-text
              px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">
            {editTransaction ? 'Update Transaction' : 'Save Transaction'}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
