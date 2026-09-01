import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, MapPin, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Race {
  id: string;
  name: string;
  date: string;
  distance: string;
  fee: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
}

export function Races() {
  const { role } = useAuth();
  const isPending = role === 'RACE_ADMIN_PENDING';

  const [races, setRaces] = useState<Race[]>([
    { id: '1', name: 'Nairobi City Marathon 2024', date: '2024-10-25', distance: '42km, 21km, 10km', fee: 2500, status: 'PUBLISHED' },
    { id: '2', name: 'Karura Forest Run', date: '2024-11-10', distance: '5km, 10km, 15km', fee: 1000, status: 'DRAFT' },
    { id: '3', name: 'Standard Chartered Marathon 2023', date: '2023-10-29', distance: '42km, 21km', fee: 2000, status: 'CLOSED' },
  ]);

  const togglePublish = (id: string) => {
    if (isPending) return; // Prevent pending users from publishing
    setRaces(races.map(race => {
      if (race.id === id && race.status === 'DRAFT') return { ...race, status: 'PUBLISHED' };
      if (race.id === id && race.status === 'PUBLISHED') return { ...race, status: 'DRAFT' };
      return race;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'DRAFT': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'CLOSED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6 font-geist">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white font-outfit">My Races</h1>
        <Link
          to="/races/new"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-primary hover:opacity-90 focus:outline-none transition-opacity"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Create New Race
        </Link>
      </div>

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
              {races.map((race) => (
                <tr key={race.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/races/${race.id}`} className="text-sm font-bold text-white hover:text-primary transition-colors font-outfit">
                      {race.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-placeholder bg-background px-3 py-1.5 rounded-lg w-fit border border-gray-800">
                      <Calendar className="flex-shrink-0 mr-2 h-4 w-4 text-primary" />
                      {race.date}
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
                      KES {race.fee}
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
                        onClick={() => togglePublish(race.id)}
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
                        onClick={() => togglePublish(race.id)}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
