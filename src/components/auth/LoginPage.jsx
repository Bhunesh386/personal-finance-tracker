import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Mail, Lock, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-light-text dark:text-dark-text">
            Financial Tracker
          </span>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-8 card-shadow">
          <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-light-muted dark:text-dark-muted mb-6">
            Sign in to your account to continue
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-negative/10 text-negative text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-light-muted dark:text-dark-muted">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-light-muted dark:text-dark-muted">
          Your money. Your markets. One place.
        </p>
      </div>
    </div>
  );
}
