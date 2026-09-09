import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, RefreshCw, Zap, AlertCircle, Filter, X, Trophy, Gift } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { Select } from '../../components/Select';
import { Tooltip } from '../../components/Tooltip';

interface AwardTransaction {
  id: number;
  transactionRef?: string;
  transaction_ref?: string;
  runner_name?: string;
  runner_phone?: string;
  race_id?: number;
  race_name?: string;
  destinationAccount?: string;
  destination_account?: string;
  awardType?: 'MONEY' | 'AIRTIME';
  award_type?: 'MONEY' | 'AIRTIME';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt?: string;
  created_at?: string;
}

interface RaceItem {
  id: number;
  name: string;
  distance?: string;
}

export function Awards() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [simulatingId, setSimulatingId] = useState<number | null>(null);

  // Read initial race and award type filter from query params
  const raceParam = searchParams.get('raceId') || searchParams.get('race_id') || 'ALL';
  const awardTypeParam = searchParams.get('awardType') || searchParams.get('award_type') || 'ALL';
  const [selectedRaceId, setSelectedRaceId] = useState<string>(raceParam);
  const [selectedAwardType, setSelectedAwardType] = useState<string>(awardTypeParam);

  // Sync state if URL search params change
  useEffect(() => {
    const currentRaceParam = searchParams.get('raceId') || searchParams.get('race_id') || 'ALL';
    const currentAwardParam = searchParams.get('awardType') || searchParams.get('award_type') || 'ALL';
    setSelectedRaceId(currentRaceParam);
    setSelectedAwardType(currentAwardParam);
  }, [searchParams]);

  // Fetch available races for dropdown (scoped to the logged-in admin)
  const { data: races = [] } = useQuery<RaceItem[]>({
    queryKey: ['admin-races-list'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<RaceItem[]>('/api/admin/races');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // Fetch live award transactions from backend filtered by race_id and award_type
  const { data: transactions = [], isLoading, isError, error, refetch, isFetching } = useQuery<AwardTransaction[]>({
    queryKey: ['award-payments', selectedRaceId, selectedAwardType],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (selectedRaceId !== 'ALL') params.race_id = selectedRaceId;
      if (selectedAwardType !== 'ALL') params.award_type = selectedAwardType;
      const res = await apiClient.get<AwardTransaction[]>('/api/awards', { params });
      return res.data;
    },
  });

  const handleRaceChange = (newRaceId: string) => {
    setSelectedRaceId(newRaceId);
    if (newRaceId === 'ALL') {
      searchParams.delete('raceId');
      searchParams.delete('race_id');
    } else {
      searchParams.set('raceId', newRaceId);
    }
    setSearchParams(searchParams);
  };

  const handleAwardTypeChange = (newType: string) => {
    setSelectedAwardType(newType);
    if (newType === 'ALL') {
      searchParams.delete('awardType');
      searchParams.delete('award_type');
    } else {
      searchParams.set('awardType', newType);
    }
    setSearchParams(searchParams);
  };

  const handleClearAllFilters = () => {
    setSelectedRaceId('ALL');
    setSelectedAwardType('ALL');
    searchParams.delete('raceId');
    searchParams.delete('race_id');
    searchParams.delete('awardType');
    searchParams.delete('award_type');
    setSearchParams(searchParams);
  };

  // Build race options for the Select dropdown
  const raceOptions = useMemo(() => {
    const options = [{ value: 'ALL', label: 'All Races (Show All Payouts)' }];
    races.forEach((r) => {
      options.push({ value: String(r.id), label: r.name });
    });
    return options;
  }, [races]);

  // Build award type options
  const awardTypeOptions = useMemo(() => [
    { value: 'ALL', label: 'All Award Types' },
    { value: 'MONEY', label: 'Mobile Money' },
    { value: 'AIRTIME', label: 'Airtime Top-up' },
  ], []);

  const selectedRaceName = useMemo(() => {
    if (selectedRaceId === 'ALL') return null;
    const found = races.find((r) => String(r.id) === selectedRaceId);
    return found ? found.name : `Race #${selectedRaceId}`;
  }, [races, selectedRaceId]);

  const hasActiveFilters = selectedRaceId !== 'ALL' || selectedAwardType !== 'ALL';

  // Simulation Mutation for demo purposes
  const simulateMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      setSimulatingId(paymentId);
      const res = await apiClient.get(`/api/awards/simulate/${paymentId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['award-payments'] });
    },
    onError: (err: any) => {
      alert(`Simulation failed: ${err.response?.data?.error || err.message}`);
    },
    onSettled: () => {
      setSimulatingId(null);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="text-green-400" size={16} />;
      case 'PENDING':
        return <Clock className="text-yellow-400 animate-pulse" size={16} />;
      case 'FAILED':
        return <XCircle className="text-red-400" size={16} />;
      default:
        return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-400 border border-green-500/30 shadow-sm shadow-green-500/10';
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 shadow-sm shadow-yellow-500/10';
      case 'FAILED':
        return 'bg-red-500/10 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Just now';
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const totalAmount = useMemo(() => {
    return transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const completedCount = useMemo(() => {
    return transactions.filter((t) => t.status === 'COMPLETED').length;
  }, [transactions]);

  return (
    <div className="space-y-6 font-geist">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-outfit">Award Payouts Tracking</h1>
          <p className="text-sm text-placeholder mt-1">
            Track real-time status of Tingg BEEP disbursements and webhook callback transitions.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-bold rounded-xl text-gray-300 bg-surface hover:bg-gray-800 transition-colors focus:outline-none"
        >
          <RefreshCw className={`-ml-1 mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh Status
        </button>
      </div>

      {isError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
          <AlertCircle size={20} />
          <span>Failed to load payouts: {(error as any)?.message || 'Network error'}</span>
        </div>
      )}

      {/* Filter & Metric Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 bg-surface rounded-xl border border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-3 flex-1">
          {/* Race Filter */}
          <div className="flex items-center gap-2 text-sm text-placeholder font-medium">
            <Filter size={16} className="text-primary" />
            <span>Race:</span>
          </div>
          <div className="w-full sm:w-64">
            <Select
              options={raceOptions}
              value={selectedRaceId}
              onChange={handleRaceChange}
              buttonClassName="px-3 py-2 text-sm"
            />
          </div>

          {/* Award Type Filter */}
          <div className="flex items-center gap-2 text-sm text-placeholder font-medium sm:ml-2">
            <Gift size={16} className="text-[#CCFF00]" />
            <span>Award Type:</span>
          </div>
          <div className="w-full sm:w-56">
            <Select
              options={awardTypeOptions}
              value={selectedAwardType}
              onChange={handleAwardTypeChange}
              buttonClassName="px-3 py-2 text-sm"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors w-fit"
            >
              <X size={14} className="text-gray-400" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Aggregate Stats */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400 border-t xl:border-t-0 border-gray-800 pt-3 xl:pt-0">
          <div>
            Total: <span className="font-bold text-white">{transactions.length}</span>
          </div>
          <div className="h-3 w-px bg-gray-700" />
          <div>
            Completed: <span className="font-bold text-green-400">{completedCount}</span>
          </div>
          <div className="h-3 w-px bg-gray-700" />
          <div>
            Volume: <span className="font-bold text-primary">KES {totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Active Filter Pills Indicator */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-placeholder">
          <span>Active Filters:</span>
          {selectedRaceName && (
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold flex items-center gap-1.5">
              <Trophy size={12} /> {selectedRaceName}
              <Tooltip content="Remove Race filter">
                <button 
                  type="button" 
                  onClick={() => handleRaceChange('ALL')} 
                  className="hover:text-white ml-0.5 rounded-full p-0.5 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </Tooltip>
            </span>
          )}
          {selectedAwardType !== 'ALL' && (
            <span className="px-2.5 py-1 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 font-bold flex items-center gap-1.5">
              <Gift size={12} /> {selectedAwardType === 'MONEY' ? 'Mobile Money' : 'Airtime'}
              <Tooltip content="Remove Award Type filter">
                <button 
                  type="button" 
                  onClick={() => handleAwardTypeChange('ALL')} 
                  className="hover:text-white ml-0.5 rounded-full p-0.5 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </Tooltip>
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-surface shadow-lg overflow-hidden sm:rounded-xl border border-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-background/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Transaction Ref
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Runner & Race
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Amount
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Destination Phone
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Type
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Date
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Demo Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-placeholder">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading award payouts from server...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-placeholder">
                    {hasActiveFilters ? (
                      <div className="flex flex-col items-center gap-2">
                        <Trophy className="h-8 w-8 text-gray-600 mb-1" />
                        <span className="text-gray-300 font-bold">No award payouts match current filters</span>
                        <p className="text-xs text-placeholder max-w-sm text-center">
                          No {selectedAwardType !== 'ALL' ? (selectedAwardType === 'MONEY' ? 'Mobile Money' : 'Airtime') : ''} payouts found
                          {selectedRaceName ? ` for ${selectedRaceName}` : ''}.
                        </p>
                        <button
                          type="button"
                          onClick={handleClearAllFilters}
                          className="mt-2 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-gray-300 hover:text-white border border-gray-700 transition-colors"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    ) : (
                      'No award transactions yet. Disburse awards from a race leaderboard to see live tracking here.'
                    )}
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => {
                  const ref = txn.transactionRef || txn.transaction_ref || `TXN-${txn.id}`;
                  const runnerName = txn.runner_name || 'Verified Winner';
                  const raceName = txn.race_name || 'Kimbia Virtual Race';
                  const phone = txn.destinationAccount || txn.destination_account || txn.runner_phone || 'N/A';
                  const rawType = txn.awardType || txn.award_type || 'MONEY';
                  const isPending = txn.status === 'PENDING';
                  const isSimulatingThis = simulatingId === txn.id;

                  return (
                    <tr key={txn.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-mono font-bold text-white bg-background/60 px-2.5 py-1 rounded inline-block border border-gray-800">
                          {ref}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-white">{runnerName}</div>
                        <div className="text-xs text-placeholder truncate max-w-[200px]">{raceName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-primary font-mono">
                          KES {Number(txn.amount).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-300 font-mono">
                        {phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded bg-gray-800 text-gray-300">
                          {rawType === 'MONEY' ? 'Mobile Money' : 'Airtime'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-medium">
                        {formatDate(txn.createdAt || txn.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-bold rounded-full transition-all duration-500 ease-out ${getStatusStyle(
                              txn.status
                            )}`}
                          >
                            {getStatusIcon(txn.status)}
                            {txn.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {isPending ? (
                          <Tooltip content="Simulate Tingg webhook callback delivering payout confirmation">
                            <button
                              type="button"
                              onClick={() => simulateMutation.mutate(txn.id)}
                              disabled={isSimulatingThis || simulateMutation.isPending}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 hover:bg-[#CCFF00]/25 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              <Zap size={13} className={`mr-1 ${isSimulatingThis ? 'animate-spin' : ''}`} />
                              {isSimulatingThis ? 'Simulating...' : 'Trigger Tingg Callback Simulation'}
                            </button>
                          </Tooltip>
                        ) : (
                          <span className="text-xs text-gray-500">Confirmed</span>
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
    </div>
  );
}
