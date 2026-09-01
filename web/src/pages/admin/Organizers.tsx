import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Select } from '../../components/Select';

interface Organizer {
  id: string;
  name: string;
  email: string;
  organization: string;
  status: 'PENDING_VETTING' | 'APPROVED';
  tinggAccountId?: string;
}

export function Organizers() {
  const [organizers, setOrganizers] = useState<Organizer[]>([
    { id: '1', name: 'John Doe', email: 'john@nairobibeer.com', organization: 'Nairobi Beer Festival', status: 'APPROVED', tinggAccountId: 'TNG-12345' },
    { id: '2', name: 'Alice Smith', email: 'alice@runclub.ke', organization: 'RunClub Kenya', status: 'PENDING_VETTING' },
    { id: '3', name: 'Bob Jones', email: 'bob@kigalimarathon.rw', organization: 'Kigali Marathon', status: 'PENDING_VETTING' },
  ]);

  const [filter, setFilter] = useState<'ALL' | 'PENDING_VETTING' | 'APPROVED'>('ALL');
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);
  const [tinggId, setTinggId] = useState('');
  const [error, setError] = useState('');

  const filteredOrganizers = organizers.filter(org => filter === 'ALL' || org.status === filter);

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedOrganizer) return;
    
    if (!tinggId.trim()) {
      setError('Please provide a Tingg Account ID.');
      return;
    }

    setOrganizers(prev => prev.map(org => 
      org.id === selectedOrganizer.id 
        ? { ...org, status: 'APPROVED', tinggAccountId: tinggId }
        : org
    ));
    setSelectedOrganizer(null);
    setTinggId('');
  };

  return (
    <div className="space-y-6 font-geist">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white font-outfit">Organizer Management</h1>
        <div className="flex gap-2 relative z-20">
          <Select 
            value={filter} 
            onChange={(val) => setFilter(val as any)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'PENDING_VETTING', label: 'Pending Vetting' },
              { value: 'APPROVED', label: 'Approved' }
            ]}
            className="w-44"
            buttonClassName="py-2 px-3 bg-surface"
          />
        </div>
      </div>

      <div className="bg-surface shadow-lg overflow-hidden sm:rounded-xl border border-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-background/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Organization
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Contact
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Tingg Account
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredOrganizers.map((org) => (
                <tr key={org.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white font-outfit text-base">{org.organization}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{org.name}</div>
                    <div className="text-sm text-placeholder">{org.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300 font-mono bg-background/50 px-2 py-1 rounded-lg border border-gray-800 inline-block">
                      {org.tinggAccountId || 'Not Linked'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                      org.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    }`}>
                      {org.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {org.status === 'PENDING_VETTING' && (
                      <button
                        onClick={() => setSelectedOrganizer(org)}
                        className="px-4 py-1.5 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors border border-primary/20"
                      >
                        Review & Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredOrganizers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-placeholder">
                    No organizers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {selectedOrganizer && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto font-geist" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setSelectedOrganizer(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-surface rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl border border-gray-800 transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-xl leading-6 font-bold text-white font-outfit" id="modal-title">
                    Approve Organizer: {selectedOrganizer.organization}
                  </h3>
                  <div className="mt-4 text-sm text-placeholder text-left space-y-3 border-b border-gray-800 pb-5">
                    <p><strong className="text-gray-300">Name:</strong> {selectedOrganizer.name}</p>
                    <p><strong className="text-gray-300">Email:</strong> {selectedOrganizer.email}</p>
                    <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 mt-4 text-primary">
                      Please ensure you have completed all offline KYC checks before approving this organizer.
                    </div>
                  </div>
                </div>
              </div>
              <form onSubmit={handleApprove} className="mt-5" noValidate>
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                    {error}
                  </div>
                )}
                <div className="mb-6">
                  <label htmlFor="tinggId" className="block text-sm font-medium text-gray-300 mb-2">
                    Tingg Sub-Merchant Account ID <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    id="tinggId"
                    value={tinggId}
                    onChange={(e) => setTinggId(e.target.value)}
                    placeholder="e.g. TNG-998877"
                    className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-background text-white placeholder-gray-600"
                  />
                  <p className="text-xs text-placeholder mt-2">This ID routes payments for their races directly to their account.</p>
                </div>
                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2.5 bg-primary text-base font-bold text-white hover:opacity-90 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-opacity"
                  >
                    Link & Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrganizer(null);
                      setError('');
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-700 shadow-sm px-4 py-2.5 bg-background text-base font-medium text-gray-300 hover:bg-gray-800 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
