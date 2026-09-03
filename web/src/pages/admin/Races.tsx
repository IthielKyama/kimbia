import { Link } from 'react-router-dom';
import { Plus, Calendar, MapPin, Tag, Users as UsersIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';

interface Race {
  id: number;
  name: string;
  raceDate: string;
  distance: string;
  fee: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
}

function RaceRow({ race, isPending }: { race: Race; isPending: boolean }) {
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
    <tr className="hover:bg-gray-800/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <Link to={`/races/${race.id}`} className="text-sm font-bold text-white hover:text-primary transition-colors font-outfit">
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
          <button
            disabled={isPending}
            className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white transition-all
              ${isPending ? 'bg-gray-700 cursor-not-allowed opacity-50' : 'bg-green-600 hover:bg-green-500'}
            `}
            title={isPending ? "You must be approved to publish races" : "Publish this race"}
          >
            Publish
          </button>
        )}
        {race.status === 'PUBLISHED' && (
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-bold rounded-xl text-gray-300 bg-background hover:bg-gray-800 hover:text-white transition-colors"
          >
            Unpublish
          </button>
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
  );
}

export function Races() {
  const { role } = useAuth();
  const isPending = role === 'RACE_ADMIN_PENDING';

  const { data: races = [], isLoading, isError, error, refetch } = useQuery<Race[]>({
    queryKey: ['races'],
    queryFn: async () => {
      const res = await apiClient.get<Race[]>('/api/races');
      return res.data;
    },
  });

  return (
    <div className="space-y-6 font-geist">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white font-outfit">My Races</h1>
          <button
            onClick={() => refetch()}
            className="p-2 text-placeholder hover:text-white rounded-lg hover:bg-surface transition-colors"
            title="Refresh races"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        <Link
          to="/races/new"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-primary hover:opacity-90 focus:outline-none transition-opacity"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Create New Race
        </Link>
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

