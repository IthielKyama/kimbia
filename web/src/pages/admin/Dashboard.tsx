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
    </div>
  );
}
