import { useState } from 'react';

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

  const filteredOrganizers = organizers.filter(org => filter === 'ALL' || org.status === filter);

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrganizer || !tinggId) return;

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
        <div className="flex gap-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-surface text-white border-gray-700 rounded-xl shadow-sm focus:ring-primary focus:border-primary text-sm py-2 px-3 border"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_VETTING">Pending Vetting</option>
            <option value="APPROVED">Approved</option>
          </select>
        </div>
      </div>

      <div className="bg-surface shadow-lg overflow-hidden sm:rounded-xl border border-gray-800">
        <ul className="divide-y divide-gray-800">
          {filteredOrganizers.map((org) => (
            <li key={org.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-800/50 transition-colors flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary truncate font-outfit text-lg">{org.organization}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                        org.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      }`}>
                        {org.status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-placeholder">
                        {org.name} <span className="mx-2 opacity-50">•</span> {org.email}
                      </p>
                    </div>
                    {org.status === 'PENDING_VETTING' && (
                      <button
                        onClick={() => setSelectedOrganizer(org)}
                        className="ml-2 px-4 py-1.5 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors"
                      >
                        Review & Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
          {filteredOrganizers.length === 0 && (
            <li className="px-4 py-8 text-center text-placeholder">No organizers found.</li>
          )}
        </ul>
      </div>

      {/* Approval Modal */}
      {selectedOrganizer && (
        <div className="fixed inset-0 z-50 overflow-y-auto font-geist" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setSelectedOrganizer(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-surface rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl border border-gray-800 transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
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
              <form onSubmit={handleApprove} className="mt-5">
                <div className="mb-6">
                  <label htmlFor="tinggId" className="block text-sm font-medium text-gray-300 mb-2">
                    Tingg Sub-Merchant Account ID <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    id="tinggId"
                    required
                    value={tinggId}
                    onChange={(e) => setTinggId(e.target.value)}
                    placeholder="e.g. TNG-998877"
                    className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-white placeholder-gray-600"
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
                    onClick={() => setSelectedOrganizer(null)}
                    className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-700 shadow-sm px-4 py-2.5 bg-background text-base font-medium text-gray-300 hover:bg-gray-800 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
