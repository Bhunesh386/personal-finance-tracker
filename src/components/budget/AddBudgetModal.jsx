import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function AddBudgetModal({ isOpen, onClose, onSave, categories = [], editBudget = null }) {
  const [categoryId, setCategoryId] = useState(editBudget?.category_id || '');
  const [amount, setAmount] = useState(editBudget?.amount?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!categoryId || !amount) return;
    setLoading(true);
    try {
      await onSave({
        category_id: categoryId,
        amount: parseFloat(amount),
      });
      onClose();
    } catch (err) {
      console.error('Error saving budget:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editBudget ? 'Edit Budget' : 'Add Budget'}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-light-muted dark:text-dark-muted mb-1.5">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-light-border dark:border-dark-border
              bg-white dark:bg-dark-bg text-light-text dark:text-dark-text
              px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>

        <Input
          label="Budget Amount (₹)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter budget amount"
        />

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} loading={loading} className="flex-1">
            {editBudget ? 'Update Budget' : 'Save Budget'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
