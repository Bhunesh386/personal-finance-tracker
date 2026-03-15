import React, { useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import PortfolioSummaryHero from '../components/portfolio/PortfolioSummaryHero';
import HoldingsTable from '../components/portfolio/HoldingsTable';
import StockDetailDrawer from '../components/portfolio/StockDetailDrawer';
import AddStockModal from '../components/portfolio/AddStockModal';
import WatchlistTab from '../components/portfolio/WatchlistTab';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'holdings', label: 'Holdings' },
  { id: 'performance', label: 'Performance' },
  { id: 'watchlist', label: 'Watchlist' },
];

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('holdings');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editHolding, setEditHolding] = useState(null);
  const [detailHolding, setDetailHolding] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false);

  const {
    holdings, watchlist, stockPrices, loading, pricesLoading, lastPriceUpdate,
    getPortfolioMetrics, getAllocation,
    addHolding, updateHolding, removeHolding,
    addToWatchlist, removeFromWatchlist,
  } = usePortfolio();

  const metrics = getPortfolioMetrics();
  const allocation = getAllocation();

  const handleAddHolding = async (data) => {
    try {
      await addHolding(data);
      toast.success('Stock added to portfolio!');
    } catch (err) {
      toast.error('Failed to add stock');
    }
  };

  const handleUpdateHolding = async (data) => {
    if (!editHolding) return;
    try {
      await updateHolding(editHolding.id, data);
      toast.success('Holding updated!');
      setEditHolding(null);
    } catch (err) {
      toast.error('Failed to update holding');
    }
  };

  const handleRemoveHolding = async () => {
    if (!deleteTarget) return;
    try {
      await removeHolding(deleteTarget.id);
      toast.success('Stock removed!');
      setDeleteTarget(null);
      setDetailHolding(null);
    } catch (err) {
      toast.error('Failed to remove stock');
    }
  };

  const handleAddToWatchlist = async (data) => {
    try {
      await addToWatchlist(data);
      toast.success('Added to watchlist!');
    } catch (err) {
      toast.error('Failed to add to watchlist');
    }
  };

  const lastUpdatedText = lastPriceUpdate
    ? `Updated ${formatDistanceToNow(lastPriceUpdate)} ago`
    : 'Fetching prices...';

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {pricesLoading && (
            <span className="text-xs text-light-muted dark:text-dark-muted">Refreshing prices...</span>
          )}
          {!pricesLoading && lastPriceUpdate && (
            <div className="flex items-center gap-1.5 text-xs text-light-muted dark:text-dark-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse-dot" />
              {lastUpdatedText}
            </div>
          )}
        </div>
        <Button onClick={() => { setEditHolding(null); setAddModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Add Stock
        </Button>
      </div>

      {/* Summary Hero */}
      <PortfolioSummaryHero metrics={metrics} allocation={allocation} />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-light-border dark:border-dark-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'holdings' && (
        <HoldingsTable
          holdings={holdings}
          stockPrices={stockPrices}
          loading={loading}
          onEdit={(h) => { setEditHolding(h); setAddModalOpen(true); }}
          onRemove={setDeleteTarget}
          onClick={setDetailHolding}
          onAdd={() => setAddModalOpen(true)}
        />
      )}

      {activeTab === 'performance' && (
        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-light-border dark:border-dark-border">
                  {['Stock', 'Invested', 'Current Value', 'P&L', 'P&L %'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-light-muted dark:text-dark-muted uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {holdings.map((h) => {
                  const price = stockPrices[h.ticker]?.price || Number(h.avg_buy_price);
                  const invested = Number(h.shares) * Number(h.avg_buy_price);
                  const value = Number(h.shares) * price;
                  const pnl = value - invested;
                  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
                  const isPnLPositive = pnl >= 0;

                  return (
                    <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-primary/5">
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-light-text dark:text-dark-text">{h.ticker}</p>
                        <p className="text-xs text-light-muted dark:text-dark-muted">{h.company_name}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-light-text dark:text-dark-text">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(invested)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-light-text dark:text-dark-text">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)}
                      </td>
                      <td className={`px-4 py-3 text-sm font-semibold ${isPnLPositive ? 'text-positive' : 'text-negative'}`}>
                        {isPnLPositive ? '+' : ''}{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(pnl)}
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium ${isPnLPositive ? 'text-positive' : 'text-negative'}`}>
                        {isPnLPositive ? '+' : ''}{pnlPct.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'watchlist' && (
        <WatchlistTab
          watchlist={watchlist}
          stockPrices={stockPrices}
          onAddToPortfolio={(item) => {
            setEditHolding(null);
            setAddModalOpen(true);
          }}
          onRemove={(id) => {
            removeFromWatchlist(id);
            toast.success('Removed from watchlist');
          }}
          onAdd={() => setWatchlistModalOpen(true)}
        />
      )}

      {/* Add/Edit Stock Modal */}
      <AddStockModal
        isOpen={addModalOpen}
        onClose={() => { setAddModalOpen(false); setEditHolding(null); }}
        onSave={editHolding ? handleUpdateHolding : handleAddHolding}
        editHolding={editHolding}
      />

      {/* Stock Detail Drawer */}
      <StockDetailDrawer
        isOpen={!!detailHolding}
        onClose={() => setDetailHolding(null)}
        holding={detailHolding}
        price={detailHolding ? stockPrices[detailHolding.ticker] : null}
        onEdit={(h) => { setDetailHolding(null); setEditHolding(h); setAddModalOpen(true); }}
        onRemove={(h) => { setDetailHolding(null); setDeleteTarget(h); }}
      />

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Stock"
        maxWidth="max-w-sm"
      >
        <p className="text-sm text-light-muted dark:text-dark-muted mb-4">
          Remove {deleteTarget?.ticker} from your portfolio? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={handleRemoveHolding} className="flex-1">Remove</Button>
        </div>
      </Modal>
    </div>
  );
}
