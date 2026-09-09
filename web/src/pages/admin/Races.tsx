import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, MapPin, Tag, Users as UsersIcon, RefreshCw, AlertCircle, Pencil } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import { Tooltip } from '../../components/Tooltip';

interface Race {
  id: number;
  name: string;
  raceDate: string;
  distance: string;
  fee: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
}

function RaceRow({ race, isPending }: { race: Race; isPending: boolean }) {
  const queryClient = useQueryClient();
  const [rowError, setRowError] = useState<string>('');

  const { data: registrations = [] } = useQuery({
    queryKey: ['race-registrations', race.id],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/api/admin/races/${race.id}/registrations`);
        return res.data;
      } catch {
        return [];
      }
    },
    enabled: !!race.id,
  });

  const statusMutation = useMutation({
    mutationFn: async (targetStatus: 'PUBLISHED' | 'CLOSED' | 'DRAFT') => {
      setRowError('');
      const res = await apiClient.put(`/api/races/${race.id}/status`, { status: targetStatus });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['races'] });
    },
    onError: (err: any) => {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to update race status';
      setRowError(errMsg);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'DRAFT': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'CLOSED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-800/50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <Link
            to={race.status === 'DRAFT' ? `/races/${race.id}/edit` : `/races/${race.id}/leaderboard`}
            className="text-sm font-bold text-white hover:text-primary transition-colors font-outfit"
          >
            {race.name}
          </Link>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center text-sm text-placeholder bg-background px-3 py-1.5 rounded-lg w-fit border border-gray-800">
            <Calendar className="flex-shrink-0 mr-2 h-4 w-4 text-primary" />
            {formatDate(race.raceDate)}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center text-sm text-placeholder bg-background px-3 py-1.5 rounded-lg w-fit border border-gray-800">
            <MapPin className="flex-shrink-0 mr-2 h-4 w-4 text-primary" />
            {race.distance}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center text-sm text-placeholder bg-background px-3 py-1.5 rounded-lg w-fit border border-gray-800">
            <Tag className="flex-shrink-0 mr-2 h-4 w-4 text-primary" />
            KES {Number(race.fee).toLocaleString()}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center text-sm text-placeholder bg-background px-3 py-1.5 rounded-lg w-fit border border-gray-800">
            <UsersIcon className="flex-shrink-0 mr-2 h-4 w-4 text-primary" />
            <span className="font-bold text-white mr-1">{registrations.length}</span> runners
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(race.status)}`}>
            {race.status}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {race.status === 'DRAFT' && (
            <div className="flex items-center gap-2">
              <Link
                to={`/races/${race.id}/edit`}
                className="inline-flex items-center px-3 py-2 border border-gray-700 shadow-sm text-sm font-bold rounded-xl text-gray-300 bg-background hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
              >
                <Pencil size={14} className="mr-1.5 text-gray-400" /> Edit
              </Link>
              <Tooltip content={isPending ? "You must be approved by Super Admin to publish races" : "Publish this race"}>
                <button
                  onClick={() => statusMutation.mutate('PUBLISHED')}
                  disabled={isPending || statusMutation.isPending}
                  className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white transition-all
                    ${isPending || statusMutation.isPending
                      ? 'bg-gray-700 cursor-not-allowed opacity-50'
                      : 'bg-green-600 hover:bg-green-500 cursor-pointer'}
                  `}
                >
                  {statusMutation.isPending ? 'Publishing...' : 'Publish'}
                </button>
              </Tooltip>
            </div>
          )}
          {race.status === 'PUBLISHED' && (
            <Tooltip content="Close this race">
              <button
                type="button"
                onClick={() => statusMutation.mutate('CLOSED')}
                disabled={statusMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-bold rounded-xl text-gray-300 bg-background hover:bg-gray-800 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {statusMutation.isPending ? 'Updating...' : 'Close Race'}
              </button>
            </Tooltip>
          )}
          {race.status === 'CLOSED' && (
            <Tooltip content="Re-open race as Draft">
              <button
                onClick={() => statusMutation.mutate('DRAFT')}
                disabled={statusMutation.isPending}
                className="inline-flex items-center px-3 py-1.5 border border-gray-700 shadow-sm text-xs font-semibold rounded-xl text-gray-400 bg-background hover:bg-gray-800 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {statusMutation.isPending ? 'Updating...' : 'Re-open Draft'}
              </button>
            </Tooltip>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <Link
            to={`/races/${race.id}/leaderboard`}
            className="inline-flex items-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-bold rounded-xl text-gray-300 bg-background hover:bg-gray-800 hover:text-white transition-colors"
          >
            Leaderboard
          </Link>
        </td>
      </tr>
      {rowError && (
        <tr>
          <td colSpan={8} className="px-6 py-2 bg-red-500/10 border-b border-red-500/20 text-xs text-red-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <AlertCircle size={14} /> {rowError}
              </span>
              <button
                type="button"
                onClick={() => setRowError('')}
                className="text-gray-400 hover:text-white text-xs underline ml-4"
              >
                Dismiss
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function Races() {
  const { role } = useAuth();
  const isPending = role === 'RACE_ADMIN_PENDING';
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: races = [], isLoading, isError, error, refetch, isFetching } = useQuery<Race[]>({
    queryKey: ['races'],
    queryFn: async () => {
      const res = await apiClient.get<Race[]>('/api/admin/races');
      return res.data;
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['races'] }),
        queryClient.invalidateQueries({ queryKey: ['race-registrations'] }),
        refetch(),
      ]);
    } catch (err) {
      console.error('Failed to refresh races:', err);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  const isSpinning = isRefreshing || isFetching;

  return (
    <div className="space-y-6 font-geist">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-outfit">My Races</h1>
          <p className="text-sm text-placeholder mt-1">
            Manage your organized events, view real-time registrations, and publish races.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isSpinning}
            className="inline-flex items-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-bold rounded-xl text-gray-300 bg-surface hover:bg-gray-800 transition-colors focus:outline-none cursor-pointer disabled:opacity-50"
            title="Refresh races and registrations"
          >
            <RefreshCw size={16} className={`-ml-1 mr-2 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? 'Refreshing...' : 'Refresh Races'}
          </button>
          <Link
            to="/races/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-primary hover:opacity-90 focus:outline-none transition-opacity"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Create New Race
          </Link>
        </div>
      </div>

      {isError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
          <AlertCircle size={20} />
          <span>Failed to load races from backend: {(error as any)?.message || 'Network error'}</span>
        </div>
      )}

      <div className="bg-surface shadow-lg overflow-hidden sm:rounded-xl border border-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-background/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Race Name
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Date
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Distance
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Fee
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Registrations
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Publish
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Leaderboard
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-placeholder">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading races from server...</span>
                    </div>
                  </td>
                </tr>
              ) : races.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-placeholder">
                    No races found. Click "Create New Race" to add one.
                  </td>
                </tr>
              ) : (
                races.map((race) => (
                  <RaceRow key={race.id} race={race} isPending={isPending} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

