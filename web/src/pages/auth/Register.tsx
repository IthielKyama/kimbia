import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name) return setError('Please enter your full name.');
    if (!formData.organization) return setError('Please enter your organization name.');
    if (!formData.email) return setError('Please enter your email address.');
    if (!formData.password) return setError('Please enter a password.');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters.');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.');

    try {
      setSubmitting(true);
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        organization: formData.organization,
      });
      navigate('/dashboard');
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please check your details.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-6 sm:px-6 lg:px-8 font-geist">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white font-outfit">Apply as an Organizer</h2>
        <p className="mt-2 text-center text-sm text-placeholder">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-6 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-800/50">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
              {error}
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-300">Full Name</label>
              <div className="mt-1">
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-background text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Organization Name</label>
              <div className="mt-1">
                <input
                  name="organization"
                  type="text"
                  value={formData.organization}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-background text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Email address</label>
              <div className="mt-1">
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-background text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <div className="mt-1">
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-background text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
              <div className="mt-1">
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                {submitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
