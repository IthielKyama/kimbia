import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Select } from '../../components/Select';
import apiClient from '../../services/apiClient';

interface Organizer {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  status: 'PENDING_VETTING' | 'APPROVED' | string;
  tinggAccountId?: string;
  tingg_service_code?: string;
  createdAt?: string;
  created_at?: string;
}

export function Organizers() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'ALL' | 'PENDING_VETTING' | 'APPROVED'>('ALL');
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);
  const [tinggId, setTinggId] = useState('');
  const [error, setError] = useState('');

  const {
    data: organizers = [],
    isLoading,
    isError,
    error: fetchError,
    refetch,
  } = useQuery<Organizer[]>({
    queryKey: ['admin-organizers', filter],
    queryFn: async () => {
      const url = filter === 'ALL'
        ? '/api/admin/organizers'
        : `/api/admin/organizers?status=${filter}`;
      const res = await apiClient.get(url);
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ organizerId, tinggServiceCode }: { organizerId: number | string; tinggServiceCode: string }) => {
      const res = await apiClient.put(`/api/admin/organizers/${organizerId}/approve`, {
        tingg_service_code: tinggServiceCode,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizers'] });
      setSelectedOrganizer(null);
      setTinggId('');
      setError('');
    },
    onError: (err: any) => {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to approve organizer.';
      setError(errMsg);
    },
  });

  const handleOpenApproveModal = (org: Organizer) => {
    setSelectedOrganizer(org);
    setTinggId(org.tingg_service_code || org.tinggAccountId || '');
    setError('');
  };

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedOrganizer) return;

    if (!tinggId.trim()) {
      setError('Please provide a Tingg Sub-Merchant Account ID (Service Code).');
      return;
    }

    approveMutation.mutate({
      organizerId: selectedOrganizer.id,
      tinggServiceCode: tinggId.trim(),
    });
  };

  return (
    <div className="space-y-6 font-geist">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-outfit">Organizer Management</h1>
          <p className="text-sm text-placeholder mt-1">Review KYC vetting requests and configure Tingg routing codes.</p>
        </div>
        <div className="flex items-center gap-3 relative z-20">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-surface border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Refresh Organizers"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Select
            value={filter}
            onChange={(val) => setFilter(val as any)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'PENDING_VETTING', label: 'Pending Vetting' },
              { value: 'APPROVED', label: 'Approved' },
            ]}
            className="w-44"
            buttonClassName="py-2 px-3 bg-surface"
          />
        </div>
      </div>

      {isError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between text-red-500 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{(fetchError as any)?.response?.data?.error || (fetchError as any)?.message || 'Failed to load organizers. Ensure you are signed in as Super Admin.'}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-surface shadow-lg overflow-hidden sm:rounded-xl border border-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-background/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Organization / Name
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Contact
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Tingg Service Code
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-placeholder">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-sm">Loading organizers...</span>
                    </div>
                  </td>
                </tr>
              ) : organizers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-placeholder">
                    No organizers found.
                  </td>
                </tr>
              ) : (
                organizers.map((org) => {
                  const tinggCode = org.tingg_service_code || org.tinggAccountId;
                  return (
                    <tr key={org.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-base font-bold text-white font-outfit">
                          {org.organization || org.name}
                        </div>
                        {org.organization && org.organization !== org.name && (
                          <div className="text-xs text-placeholder">{org.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{org.email}</div>
                        {org.phone && (
                          <div className="text-xs text-placeholder">{org.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tinggCode ? (
                          <div className="text-sm text-gray-300 font-mono bg-background/50 px-2.5 py-1 rounded-lg border border-gray-800 inline-block">
                            {tinggCode}
                          </div>
                        ) : (
                          <span className="text-xs text-placeholder italic">Not Linked</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                          org.status === 'APPROVED'
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                        }`}>
                          {org.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {org.status === 'PENDING_VETTING' ? (
                          <button
                            onClick={() => handleOpenApproveModal(org)}
                            className="px-4 py-1.5 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors border border-primary/20"
                          >
                            Review & Approve
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-green-500/80 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {selectedOrganizer && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto font-geist" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => !approveMutation.isPending && setSelectedOrganizer(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-surface rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl border border-gray-800 transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-xl leading-6 font-bold text-white font-outfit" id="modal-title">
                    Approve Organizer: {selectedOrganizer.organization || selectedOrganizer.name}
                  </h3>
                  <div className="mt-4 text-sm text-placeholder text-left space-y-2 border-b border-gray-800 pb-5">
                    <p><strong className="text-gray-300">Name:</strong> {selectedOrganizer.name}</p>
                    <p><strong className="text-gray-300">Email:</strong> {selectedOrganizer.email}</p>
                    {selectedOrganizer.phone && (
                      <p><strong className="text-gray-300">Phone:</strong> {selectedOrganizer.phone}</p>
                    )}
                    <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 mt-4 text-primary text-xs">
                      Please ensure offline KYC documentation (identity proof, business registration) has been confirmed before approving.
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
                    Tingg Sub-Merchant Service Code <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    id="tinggId"
                    value={tinggId}
                    onChange={(e) => setTinggId(e.target.value)}
                    placeholder="e.g. SRV-TINGG-KMB-101"
                    className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-background text-white placeholder-gray-600"
                    disabled={approveMutation.isPending}
                    autoFocus
                  />
                  <p className="text-xs text-placeholder mt-2">
                    This sub-merchant service code routes race entry payments and disbursements directly through Tingg.
                  </p>
                </div>
                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    disabled={approveMutation.isPending}
                    className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2.5 bg-primary text-base font-bold text-white hover:opacity-90 focus:outline-none sm:w-auto sm:text-sm transition-opacity disabled:opacity-50"
                  >
                    {approveMutation.isPending ? 'Linking & Approving...' : 'Link & Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={approveMutation.isPending}
                    onClick={() => {
                      setSelectedOrganizer(null);
                      setError('');
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-700 shadow-sm px-4 py-2.5 bg-background text-base font-medium text-gray-300 hover:bg-gray-800 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
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
