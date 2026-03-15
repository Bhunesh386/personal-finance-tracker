import React, { useState, useEffect, useRef } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { searchSymbols } from '../../lib/twelvedata';
import { Search } from 'lucide-react';

export default function AddStockModal({ isOpen, onClose, onSave, editHolding = null }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [searching, setSearching] = useState(false);
  const [formData, setFormData] = useState({
    shares: '',
    avg_buy_price: '',
    date_of_purchase: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (editHolding) {
      setSelectedStock({
        symbol: editHolding.ticker,
        name: editHolding.company_name,
        exchange: editHolding.exchange,
      });
      setFormData({
        shares: editHolding.shares?.toString() || '',
        avg_buy_price: editHolding.avg_buy_price?.toString() || '',
        date_of_purchase: editHolding.date_of_purchase || '',
        notes: editHolding.notes || '',
      });
    } else {
      setSelectedStock(null);
      setFormData({ shares: '', avg_buy_price: '', date_of_purchase: '', notes: '' });
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [editHolding, isOpen]);

  // Debounced search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchSymbols(query);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSelectStock = (stock) => {
    setSelectedStock(stock);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSave = async () => {
    if (!selectedStock || !formData.shares || !formData.avg_buy_price) return;
    setLoading(true);
    try {
      await onSave({
        ticker: selectedStock.symbol,
        company_name: selectedStock.name,
        exchange: selectedStock.exchange || 'OTHER',
        shares: parseFloat(formData.shares),
        avg_buy_price: parseFloat(formData.avg_buy_price),
        date_of_purchase: formData.date_of_purchase || null,
        notes: formData.notes || null,
      });
      onClose();
    } catch (err) {
      console.error('Error saving stock:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editHolding ? 'Edit Holding' : 'Add Stock'} maxWidth="max-w-md">
      <div className="space-y-4">
        {/* Stock search */}
        {!selectedStock && (
          <div className="relative">
            <Input
              label="Search Stock"
              icon={Search}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Type ticker or company name..."
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectStock(r)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="text-sm font-medium text-light-text dark:text-dark-text">{r.symbol}</span>
                      <span className="text-xs text-light-muted dark:text-dark-muted ml-2">{r.name}</span>
                    </div>
                    <span className="text-xs text-light-muted dark:text-dark-muted">{r.exchange}</span>
                  </button>
                ))}
              </div>
            )}
            {searching && <p className="text-xs text-light-muted dark:text-dark-muted mt-1">Searching...</p>}
          </div>
        )}

        {/* Selected stock */}
        {selectedStock && (
          <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-light-text dark:text-dark-text">{selectedStock.symbol}</p>
              <p className="text-xs text-light-muted dark:text-dark-muted">{selectedStock.name} • {selectedStock.exchange}</p>
            </div>
            {!editHolding && (
              <button
                onClick={() => setSelectedStock(null)}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                Change
              </button>
            )}
          </div>
        )}

        <Input
          label="Shares Held"
          type="number"
          value={formData.shares}
          onChange={(e) => setFormData(f => ({ ...f, shares: e.target.value }))}
          placeholder="e.g. 10"
          required
        />

        <Input
          label="Average Buy Price (₹)"
          type="number"
          value={formData.avg_buy_price}
          onChange={(e) => setFormData(f => ({ ...f, avg_buy_price: e.target.value }))}
          placeholder="e.g. 2500.00"
          required
        />

        <Input
          label="Date of Purchase"
          type="date"
          value={formData.date_of_purchase}
          onChange={(e) => setFormData(f => ({ ...f, date_of_purchase: e.target.value }))}
        />

        <div>
          <label className="block text-sm font-medium text-light-muted dark:text-dark-muted mb-1.5">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
            placeholder="Optional notes..."
            rows={2}
            className="w-full rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} loading={loading} disabled={!selectedStock} className="flex-1">
            {editHolding ? 'Update' : 'Add to Portfolio'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
