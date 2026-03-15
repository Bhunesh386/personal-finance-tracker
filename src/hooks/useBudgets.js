import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import useStore from '../store/useStore';

export function useBudgets(month, year) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useStore();

  const fetchBudgets = useCallback(async () => {
    if (!user || !month || !year) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budgets')
        .select('*, categories(id, name, icon, color, type)')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year);
      if (error) throw error;
      setBudgets(data || []);
    } catch (err) {
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  }, [user, month, year]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // Get actual spending per budget category for the given month/year
  const fetchBudgetSpending = useCallback(async () => {
    if (!user || !month || !year) return {};
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

      const { data, error } = await supabase
        .from('transactions')
        .select('amount, category_id')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      const spending = {};
      (data || []).forEach(t => {
        if (!spending[t.category_id]) spending[t.category_id] = 0;
        spending[t.category_id] += Number(t.amount);
      });
      return spending;
    } catch (err) {
      console.error('Error fetching budget spending:', err);
      return {};
    }
  }, [user, month, year]);

  const addBudget = async (budget) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert([{ ...budget, user_id: user.id, month, year }])
        .select('*, categories(id, name, icon, color, type)')
        .single();
      if (error) throw error;
      setBudgets(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding budget:', err);
      throw err;
    }
  };

  const updateBudget = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select('*, categories(id, name, icon, color, type)')
        .single();
      if (error) throw error;
      setBudgets(prev => prev.map(b => b.id === id ? data : b));
      return data;
    } catch (err) {
      console.error('Error updating budget:', err);
      throw err;
    }
  };

  const deleteBudget = async (id) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error deleting budget:', err);
      throw err;
    }
  };

  return {
    budgets,
    loading,
    fetchBudgets,
    fetchBudgetSpending,
    addBudget,
    updateBudget,
    deleteBudget,
  };
}
