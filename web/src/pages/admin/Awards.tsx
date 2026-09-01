import { useState } from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface AwardTransaction {
  id: string;
  runnerName: string;
  raceName: string;
  type: 'MOBILE_MONEY' | 'AIRTIME';
  amount: number;
  phone: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  date: string;
}

export function Awards() {
  const [transactions] = useState<AwardTransaction[]>([
    { id: 'TXN-001', runnerName: 'Eliud K.', raceName: 'Nairobi City Marathon 2024', type: 'MOBILE_MONEY', amount: 50000, phone: '254700000001', status: 'COMPLETED', date: '2024-10-26 14:30' },
    { id: 'TXN-002', runnerName: 'Mary K.', raceName: 'Nairobi City Marathon 2024', type: 'AIRTIME', amount: 1000, phone: '254700000002', status: 'PENDING', date: '2024-10-26 14:35' },
    { id: 'TXN-003', runnerName: 'John D.', raceName: 'Standard Chartered Marathon 2023', type: 'MOBILE_MONEY', amount: 20000, phone: '254700000003', status: 'FAILED', date: '2023-10-30 09:15' },
  ]);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <CheckCircle className="text-green-500" size={18} />;
      case 'PENDING': return <Clock className="text-yellow-500" size={18} />;
      case 'FAILED': return <XCircle className="text-red-500" size={18} />;
      default: return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'COMPLETED': return 'bg-green-500/10 text-green-500 border border-green-500/20';
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      case 'FAILED': return 'bg-red-500/10 text-red-500 border border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6 font-geist">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white font-outfit">Award Payouts Tracking</h1>
          <p className="text-sm text-placeholder mt-1">Track the status of postpayment webhooks from Tingg API.</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-bold rounded-xl text-gray-300 bg-surface hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background">
          <RefreshCw className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
          Refresh Status
        </button>
      </div>

      <div className="bg-surface shadow-lg overflow-hidden sm:rounded-xl border border-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-background/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Transaction ID
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Runner & Race
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Amount
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white font-mono bg-background/50 px-2 py-1 rounded inline-block border border-gray-800">
                      {txn.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white">{txn.runnerName}</div>
                    <div className="text-sm text-placeholder truncate max-w-[200px]">{txn.raceName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-primary">KES {txn.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded bg-gray-800 text-gray-300">
                      {txn.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-medium">
                    {txn.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(txn.status)}
                      <span className={`ml-2 px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusStyle(txn.status)}`}>
                        {txn.status}
                      </span>
                    </div>
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
