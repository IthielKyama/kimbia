import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Trophy, Gift, ArrowUpDown, CheckCircle, XCircle, Eye, 
  RefreshCw, AlertCircle, ExternalLink, ChevronRight, Clock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { Select } from '../../components/Select';
import { NumberInput } from '../../components/NumberInput';
import apiClient from '../../services/apiClient';

interface RaceResultItem {
  id: number;
  registration_id: number;
  runner_name: string;
  runner_email: string;
  runner_phone?: string;
  user_id?: number;
  race_id: number;
  bib_number: string;
  finishing_time: string;
  proof_image_url?: string;
  is_dnf?: boolean;
  moderation_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  category?: string;
  gender?: string;
  submitted_at?: string;
}

export function Leaderboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const isPending = role === 'RACE_ADMIN_PENDING';

  // Fetch race details
  const { data: race } = useQuery({
    queryKey: ['race', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/races/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Fetch race results
  const { data: results = [], isLoading, isError, error, refetch, isFetching } = useQuery<RaceResultItem[]>({
    queryKey: ['race-results', id],
    queryFn: async () => {
      const res = await apiClient.get<RaceResultItem[]>(`/api/admin/races/${id}/results`);
      return res.data;
    },
    enabled: !!id,
  });

  // Proof inspection modal state
  const [viewingProofItem, setViewingProofItem] = useState<RaceResultItem | null>(null);

  // Award Modal state
  const [selectedRunner, setSelectedRunner] = useState<RaceResultItem | null>(null);
  const [awardType, setAwardType] = useState<'AIRTIME' | 'MOBILE_MONEY'>('MOBILE_MONEY');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('5000');
  const [payoutFeedback, setPayoutFeedback] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    txRef?: string;
  }>({ status: 'idle', message: '' });

  // Moderate mutation (Approve / Reject)
  const moderateMutation = useMutation({
    mutationFn: async ({ resultId, status }: { resultId: number; status: 'APPROVED' | 'REJECTED' }) => {
      const res = await apiClient.put(`/api/admin/results/${resultId}/moderate`, {
        moderation_status: status,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['race-results', id] });
      if (viewingProofItem) {
        setViewingProofItem(null);
      }
    },
    onError: (err: any) => {
      alert(`Moderation failed: ${err.response?.data?.error || err.message}`);
    },
  });

  // Award Payout mutation
  const payoutMutation = useMutation({
    mutationFn: async (payload: {
      user_id?: number;
      registration_id: number;
      award_type: string;
      destination_account: string;
      amount: number;
    }) => {
      const res = await apiClient.post('/api/awards/payout', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setPayoutFeedback({
        status: 'success',
        message: 'Disbursement queued with Tingg (Status: PENDING)',
        txRef: data?.merchant_transaction_id || data?.transaction_ref,
      });
      queryClient.invalidateQueries({ queryKey: ['award-payments'] });
    },
    onError: (err: any) => {
      setPayoutFeedback({
        status: 'error',
        message: err.response?.data?.error || err.response?.data?.message || 'Failed to initiate payout with Tingg.',
      });
    },
  });

  const openAwardModal = (runner: RaceResultItem) => {
    setSelectedRunner(runner);
    setAwardType('MOBILE_MONEY');
    setPhone(runner.runner_phone || '');
    setAmount('5000');
    setPayoutFeedback({ status: 'idle', message: '' });
  };

  const handleAwardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRunner) return;

    if (!phone.trim()) {
      setPayoutFeedback({ status: 'error', message: 'Please provide a valid destination phone number.' });
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setPayoutFeedback({ status: 'error', message: 'Please enter a valid payout amount.' });
      return;
    }

    setPayoutFeedback({ status: 'loading', message: '' });
    payoutMutation.mutate({
      user_id: selectedRunner.user_id,
      registration_id: selectedRunner.registration_id,
      award_type: awardType === 'MOBILE_MONEY' ? 'MONEY' : 'AIRTIME',
      destination_account: phone.trim(),
      amount: Number(amount),
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 inline-flex items-center gap-1 text-xs font-bold rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle size={12} /> Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 inline-flex items-center gap-1 text-xs font-bold rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Clock size={12} /> Pending Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 inline-flex items-center gap-1 text-xs font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 font-geist">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-placeholder mb-1">
            <Link to="/races" className="hover:text-white transition-colors">Races</Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">{race?.name || `Race #${id}`}</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-outfit">Race Moderation & Leaderboard</h1>
          <p className="text-sm text-placeholder">
            {race ? `${race.name} • ${race.distance || ''}` : `Race ID: ${id}`}
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-bold rounded-xl text-gray-300 bg-surface hover:bg-gray-800 transition-colors focus:outline-none"
        >
          <RefreshCw className={`-ml-1 mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh Results
        </button>
      </div>

      {isError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
          <AlertCircle size={20} />
          <span>Failed to load results: {(error as any)?.message || 'Network error'}</span>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-surface shadow-lg overflow-hidden sm:rounded-xl border border-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-background/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Position
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Runner
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center cursor-pointer hover:text-white transition-colors font-outfit">
                  Finishing Time <ArrowUpDown size={14} className="ml-1" />
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Proof
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Moderation
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Award
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-placeholder">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading race submissions from server...</span>
                    </div>
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-placeholder">
                    No runner submissions found for this race yet.
                  </td>
                </tr>
              ) : (
                results.map((runner, index) => {
                  const isApproved = runner.moderation_status === 'APPROVED';
                  const isPendingResult = runner.moderation_status === 'PENDING';

                  return (
                    <tr key={runner.id} className="hover:bg-gray-800/50 transition-colors">
                      {/* Position */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                        {index === 0 && <Trophy className="inline text-yellow-500 mr-2" size={18} />}
                        {index === 1 && <Trophy className="inline text-gray-400 mr-2" size={18} />}
                        {index === 2 && <Trophy className="inline text-amber-600 mr-2" size={18} />}
                        #{index + 1}
                      </td>

                      {/* Runner Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-white">{runner.runner_name || 'Runner'}</div>
                        <div className="text-xs text-placeholder flex items-center gap-2 mt-0.5">
                          <span>Bib: {runner.bib_number || 'N/A'}</span>
                          {runner.runner_email && <span>• {runner.runner_email}</span>}
                        </div>
                      </td>

                      {/* Finishing Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-bold text-[#CCFF00] bg-background/60 px-3 py-1 rounded-lg inline-block border border-gray-800">
                          {runner.finishing_time || '--:--:--'}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(runner.moderation_status)}
                      </td>

                      {/* View Proof Button */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {runner.proof_image_url ? (
                          <button
                            type="button"
                            onClick={() => setViewingProofItem(runner)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
                          >
                            <Eye size={14} className="text-primary" />
                            View Proof
                          </button>
                        ) : (
                          <span className="text-xs text-placeholder">No photo</span>
                        )}
                      </td>

                      {/* Moderation Actions (Approve / Reject) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {isPendingResult ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => moderateMutation.mutate({ resultId: runner.id, status: 'APPROVED' })}
                              disabled={moderateMutation.isPending}
                              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30 transition-colors"
                              title="Approve Result"
                            >
                              <CheckCircle size={14} className="mr-1" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => moderateMutation.mutate({ resultId: runner.id, status: 'REJECTED' })}
                              disabled={moderateMutation.isPending}
                              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 transition-colors"
                              title="Reject Result"
                            >
                              <XCircle size={14} className="mr-1" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {isApproved ? 'Moderated' : 'Resolved'}
                          </span>
                        )}
                      </td>

                      {/* Award Button */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => openAwardModal(runner)}
                          disabled={!isApproved || isPending}
                          className={`flex items-center font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                            isApproved && !isPending
                              ? 'text-primary bg-primary/10 border-primary/20 hover:bg-primary/20 cursor-pointer'
                              : 'text-gray-500 bg-gray-800/40 border-gray-800 cursor-not-allowed opacity-50'
                          }`}
                          title={!isApproved ? 'Result must be approved to issue awards' : 'Issue Tingg Award Payout'}
                        >
                          <Gift size={15} className="mr-1.5" /> Award
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Inspection Modal */}
      {viewingProofItem && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto font-geist" aria-labelledby="proof-modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setViewingProofItem(null)}></div>
            <div className="relative z-10 inline-block bg-surface rounded-2xl max-w-lg w-full p-6 text-left overflow-hidden shadow-2xl border border-gray-800 my-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white font-outfit" id="proof-modal-title">
                    Photo Proof Verification
                  </h3>
                  <p className="text-sm text-placeholder mt-0.5">
                    {viewingProofItem.runner_name} • Bib #{viewingProofItem.bib_number}
                  </p>
                </div>
                <div className="bg-background px-3 py-1 rounded-lg border border-gray-800">
                  <span className="text-xs text-placeholder block">Submitted Time</span>
                  <span className="text-[#CCFF00] font-mono font-bold text-base">{viewingProofItem.finishing_time}</span>
                </div>
              </div>

              {/* Photo Display */}
              <div className="bg-background rounded-xl overflow-hidden border border-gray-800 mb-5 relative flex items-center justify-center max-h-[350px]">
                {viewingProofItem.proof_image_url ? (
                  <img
                    src={viewingProofItem.proof_image_url}
                    alt="Proof photo"
                    className="w-full h-auto max-h-[350px] object-contain rounded-xl"
                  />
                ) : (
                  <div className="py-12 text-placeholder text-sm">No image available</div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewingProofItem(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-700 bg-background text-sm font-bold text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Close Preview
                </button>

                {viewingProofItem.moderation_status === 'PENDING' && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => moderateMutation.mutate({ resultId: viewingProofItem.id, status: 'REJECTED' })}
                      disabled={moderateMutation.isPending}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-600/20 text-red-400 text-sm font-bold hover:bg-red-600/30 transition-colors"
                    >
                      Reject Proof
                    </button>
                    <button
                      type="button"
                      onClick={() => moderateMutation.mutate({ resultId: viewingProofItem.id, status: 'APPROVED' })}
                      disabled={moderateMutation.isPending}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-transparent bg-green-600 text-white text-sm font-bold hover:bg-green-500 transition-colors"
                    >
                      Approve Result
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Award Distribution Modal */}
      {selectedRunner && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto font-geist" aria-labelledby="award-modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setSelectedRunner(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-surface rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl border border-gray-800 transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 border border-primary/20">
                  <Gift className="h-7 w-7 text-primary" aria-hidden="true" />
                </div>
                <div className="mt-4 text-center sm:mt-5">
                  <h3 className="text-xl leading-6 font-bold text-white font-outfit" id="award-modal-title">
                    Distribute Award to {selectedRunner.runner_name}
                  </h3>
                  <div className="mt-2 text-sm text-placeholder">
                    <p>Initiate Tingg disbursement to the verified winner.</p>
                  </div>
                </div>
              </div>

              {/* Success Feedback View */}
              {payoutFeedback.status === 'success' ? (
                <div className="mt-6 space-y-4 border-t border-gray-800 pt-5 text-center">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
                    <CheckCircle className="mx-auto h-8 w-8 text-green-400 mb-2" />
                    <p className="font-bold text-base">{payoutFeedback.message}</p>
                    {payoutFeedback.txRef && (
                      <p className="text-xs text-gray-300 font-mono mt-1">Ref: {payoutFeedback.txRef}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRunner(null);
                        navigate(`/awards?raceId=${id}`);
                      }}
                      className="w-full inline-flex justify-center items-center rounded-xl px-4 py-3 bg-primary text-sm font-bold text-white hover:opacity-90 transition-opacity"
                    >
                      View in Award Payouts Tracking <ExternalLink size={16} className="ml-2" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRunner(null)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-background text-sm font-bold text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAwardSubmit} className="mt-6 space-y-5 border-t border-gray-800 pt-5" noValidate>
                  {payoutFeedback.status === 'error' && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                      {payoutFeedback.message}
                    </div>
                  )}

                  {/* Pre-populated Runner Details Card */}
                  <div className="bg-background/80 p-3.5 rounded-xl border border-gray-800 space-y-1.5 text-xs text-placeholder">
                    <div className="flex justify-between">
                      <span>Runner:</span>
                      <span className="text-white font-semibold">{selectedRunner.runner_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Registration ID:</span>
                      <span className="text-white font-mono">#{selectedRunner.registration_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Official Time:</span>
                      <span className="text-[#CCFF00] font-mono font-bold">{selectedRunner.finishing_time}</span>
                    </div>
                  </div>

                  <div className="relative z-20">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Award Type</label>
                    <Select
                      value={awardType}
                      onChange={(val) => setAwardType(val as any)}
                      options={[
                        { value: 'MOBILE_MONEY', label: 'Mobile Money' },
                        { value: 'AIRTIME', label: 'Airtime Top-up' }
                      ]}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Destination Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 254700000000"
                      className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-white placeholder-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Amount (KES)</label>
                    <NumberInput
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="5000"
                      step={100}
                    />
                  </div>

                  {isPending && (
                    <p className="text-xs text-red-500 mt-2 text-center bg-red-500/10 p-2 rounded-lg">
                      You must be approved by a Super Admin to distribute awards.
                    </p>
                  )}

                  <div className="mt-6 sm:mt-8 sm:flex sm:flex-row-reverse gap-3">
                    <button
                      type="submit"
                      disabled={isPending || payoutFeedback.status === 'loading'}
                      className={`w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-sm px-4 py-3 text-base font-bold text-white focus:outline-none transition-opacity sm:w-auto sm:text-sm
                        ${isPending || payoutFeedback.status === 'loading' ? 'bg-gray-700 cursor-not-allowed opacity-50' : 'bg-primary hover:opacity-90'}`}
                    >
                      {payoutFeedback.status === 'loading' ? (
                        <>
                          <RefreshCw size={16} className="animate-spin mr-2" />
                          Initiating Payout...
                        </>
                      ) : (
                        'Initiate Payout'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRunner(null)}
                      className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-700 shadow-sm px-4 py-3 bg-background text-base font-bold text-gray-300 hover:bg-gray-800 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}

