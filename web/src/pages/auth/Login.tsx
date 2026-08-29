import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('admin@kimbia.com');
  const [password, setPassword] = useState('password');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('super')) {
      login('SUPER_ADMIN');
      navigate('/admin/organizers');
    } else if (email.includes('pending')) {
      login('RACE_ADMIN_PENDING');
      navigate('/dashboard');
    } else {
      login('RACE_ADMIN_APPROVED');
      navigate('/dashboard');
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
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-300">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-white"
                />
              </div>
              <p className="mt-2 text-xs text-placeholder">Hint: Use 'super', 'pending', or any other email for testing roles.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-white"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-surface transition-opacity"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
