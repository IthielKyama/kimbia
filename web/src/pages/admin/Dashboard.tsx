import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Activity, AlertTriangle } from 'lucide-react';

const data = [
  { name: 'Mon', revenue: 4000, registrations: 24 },
  { name: 'Tue', revenue: 3000, registrations: 18 },
  { name: 'Wed', revenue: 2000, registrations: 12 },
  { name: 'Thu', revenue: 2780, registrations: 19 },
  { name: 'Fri', revenue: 1890, registrations: 10 },
  { name: 'Sat', revenue: 2390, registrations: 15 },
  { name: 'Sun', revenue: 3490, registrations: 21 },
];

export function Dashboard() {
  const { role } = useAuth();
  const isPending = role === 'RACE_ADMIN_PENDING';

  return (
    <div className="space-y-6 font-geist">
      {isPending && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-start">
          <AlertTriangle className="text-yellow-500 mr-3 mt-0.5" size={20} />
          <div>
            <h3 className="text-sm font-medium text-yellow-500 font-outfit">Account Pending Verification</h3>
            <div className="mt-1 text-sm text-yellow-500/80">
              <p>Your account is currently under review by our team. You can draft new races and upload templates, but the <strong className="text-yellow-500">Publish</strong> feature is disabled until your Tingg sub-merchant account is linked.</p>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-white font-outfit">Dashboard Overview</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1 */}
        <div className="bg-surface overflow-hidden shadow-lg rounded-xl border border-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-placeholder truncate">Total Revenue</dt>
                  <dd>
                    <div className="text-lg font-bold text-white">KES 19,550</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-background/50 px-5 py-3 border-t border-gray-800">
            <div className="text-sm text-green-500 font-medium">+12% from last week</div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface overflow-hidden shadow-lg rounded-xl border border-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-placeholder truncate">Total Registrations</dt>
                  <dd>
                    <div className="text-lg font-bold text-white">119</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-background/50 px-5 py-3 border-t border-gray-800">
            <div className="text-sm text-green-500 font-medium">+4% from last week</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface overflow-hidden shadow-lg rounded-xl border border-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-placeholder truncate">Payment Success Rate</dt>
                  <dd>
                    <div className="text-lg font-bold text-white">98.2%</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-background/50 px-5 py-3 border-t border-gray-800">
            <div className="text-sm text-placeholder">Via Tingg Gateway</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-surface shadow-lg rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4 font-outfit">Revenue Over Time</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} />
                <Tooltip 
                  cursor={{ fill: '#1f2937' }} 
                  contentStyle={{ backgroundColor: '#161F30', borderColor: '#374151', color: '#fff', borderRadius: '0.5rem' }} 
                />
                <Bar dataKey="revenue" fill="#FF4C29" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface shadow-lg rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4 font-outfit">Registrations Over Time</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} />
                <Tooltip 
                  cursor={{ fill: '#1f2937' }} 
                  contentStyle={{ backgroundColor: '#161F30', borderColor: '#374151', color: '#fff', borderRadius: '0.5rem' }} 
                />
                <Bar dataKey="registrations" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-surface shadow-lg rounded-xl border border-gray-800">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white font-outfit">Pending Results Moderation</h2>
            <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 py-1 rounded font-bold border border-yellow-500/20">3 Requires Action</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-background/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">Runner</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">Race</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">Time Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[
                  { id: 1, runner: 'Jane Doe', race: 'Nairobi Marathon 5K', time: '00:24:15', proof: 'image.jpg' },
                  { id: 2, runner: 'Mark Smith', race: 'Nairobi Marathon 10K', time: '00:48:30', proof: 'proof.png' },
                  { id: 3, runner: 'Sarah Lee', race: 'Karura Forest Run', time: '01:10:05', proof: 'strava_ss.jpg' },
                ].map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{item.runner}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{item.race}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">{item.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-primary hover:text-white bg-primary/10 hover:bg-primary px-3 py-1 rounded transition-colors font-semibold text-xs border border-primary/20">
                        Review Proof
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface shadow-lg rounded-xl border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-bold text-white font-outfit">Recent Registrations</h2>
          </div>
          <ul className="divide-y divide-gray-800">
            {[
              { id: 101, name: 'Alex K.', race: 'Nairobi Marathon', amount: 'KES 2,500', time: '10 mins ago' },
              { id: 102, name: 'Brian M.', race: 'Karura Forest Run', amount: 'KES 1,000', time: '1 hour ago' },
              { id: 103, name: 'Stella N.', race: 'Nairobi Marathon', amount: 'KES 2,500', time: '2 hours ago' },
              { id: 104, name: 'David O.', race: 'Standard Chartered', amount: 'KES 2,000', time: '3 hours ago' },
            ].map((reg) => (
              <li key={reg.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-white">{reg.name}</p>
                    <p className="text-xs text-placeholder mt-0.5">{reg.race}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-500">{reg.amount}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{reg.time}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
