import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('organizer@kimbia.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setSubmitting(true);
      const { role } = await login(email, password);
      if (role === 'SUPER_ADMIN') {
        navigate('/admin/organizers');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to log in. Please check your credentials.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-geist">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white font-outfit">Sign in to Kimbia</h2>
        <p className="mt-2 text-center text-sm text-placeholder">
          Or{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
            register as a new organizer
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-800/50">
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleLogin} noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-300">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-background text-white"
                />
              </div>
              <div className="mt-2 text-xs text-placeholder space-y-1">
                <p className="font-semibold text-gray-400">Demo Accounts (Password: <code className="text-primary">password123</code>):</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setEmail('organizer@kimbia.com'); setPassword('password123'); }}
                    className="px-2 py-0.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded text-xs border border-green-500/20"
                  >
                    Approved Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmail('pending@kimbia.com'); setPassword('password123'); }}
                    className="px-2 py-0.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded text-xs border border-yellow-500/20"
                  >
                    Pending Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmail('superadmin@kimbia.com'); setPassword('password123'); }}
                    className="px-2 py-0.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded text-xs border border-purple-500/20"
                  >
                    Super Admin
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-background text-white"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:opacity-90 focus:outline-none transition-opacity disabled:opacity-50"
              >
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
