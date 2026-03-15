import React, { useState, useCallback, useEffect } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import TransactionSummaryCards from '../components/transactions/TransactionSummaryCards';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionTable from '../components/transactions/TransactionTable';
import AddTransactionDrawer from '../components/transactions/AddTransactionDrawer';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Plus, Download, Filter } from 'lucide-react';
import { formatCurrency, generateCSV, downloadCSV, formatDate } from '../lib/utils';
import toast from 'react-hot-toast';

export default function Transactions() {
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [monthlyTotals, setMonthlyTotals] = useState({ income: 0, expense: 0 });

  const {
    transactions, loading, totalCount, totalPages,
    fetchTransactions, getMonthlyTotals,
    addTransaction, updateTransaction, deleteTransaction,
  } = useTransactions({ type: type === 'all' ? undefined : type, search, page });

  const { categories } = useCategories();

  useEffect(() => {
    getMonthlyTotals().then(setMonthlyTotals);
  }, []); // eslint-disable-line

  const handleSave = async (data) => {
    try {
      if (editTransaction) {
        await updateTransaction(editTransaction.id, data);
        toast.success('Transaction updated!');
      } else {
        await addTransaction(data);
        toast.success('Transaction added!');
      }
      setEditTransaction(null);
      const totals = await getMonthlyTotals();
      setMonthlyTotals(totals);
    } catch (err) {
      toast.error('Failed to save transaction');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTransaction(deleteTarget.id);
      toast.success('Transaction deleted!');
      setDeleteTarget(null);
      const totals = await getMonthlyTotals();
      setMonthlyTotals(totals);
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleExport = () => {
    const columns = [
      { label: 'Date', accessor: (r) => r.date },
      { label: 'Description', accessor: (r) => r.description },
      { label: 'Category', accessor: (r) => r.categories?.name || '' },
      { label: 'Type', accessor: (r) => r.type },
      { label: 'Amount', accessor: (r) => r.amount },
      { label: 'Payment Method', accessor: (r) => r.payment_method || '' },
      { label: 'Merchant', accessor: (r) => r.merchant || '' },
      { label: 'Notes', accessor: (r) => r.notes || '' },
    ];
    const csv = generateCSV(transactions, columns);
    downloadCSV(csv, `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success('CSV exported!');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div />
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button onClick={() => { setEditTransaction(null); setDrawerOpen(true); }}>
            <Plus className="w-4 h-4" /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <TransactionSummaryCards income={monthlyTotals.income} expense={monthlyTotals.expense} />

      {/* Filters */}
      <TransactionFilters
        type={type}
        onTypeChange={(t) => { setType(t); setPage(1); }}
        search={search}
        onSearchChange={(s) => { setSearch(s); setPage(1); }}
      />

      {/* Table */}
      <TransactionTable
        transactions={transactions}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={setPage}
        onEdit={(t) => { setEditTransaction(t); setDrawerOpen(true); }}
        onDelete={setDeleteTarget}
      />

      {/* Add/Edit Drawer */}
      <AddTransactionDrawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditTransaction(null); }}
        onSave={handleSave}
        editTransaction={editTransaction}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Transaction"
        maxWidth="max-w-sm"
      >
        <p className="text-sm text-light-muted dark:text-dark-muted mb-4">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={handleDelete} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
