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
        <ul className="divide-y divide-gray-800">
          {transactions.map((txn) => (
            <li key={txn.id}>
              <div className="px-4 py-5 sm:px-6 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-background/50 px-3 py-1.5 rounded-lg border border-gray-800">
                    {getStatusIcon(txn.status)}
                    <p className="ml-2 text-sm font-bold text-white font-mono">
                      {txn.id}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusStyle(txn.status)}`}>
                      {txn.status}
                    </p>
                  </div>
                </div>
                <div className="mt-4 sm:flex sm:justify-between">
                  <div className="sm:flex flex-col sm:flex-row sm:gap-6 bg-background/30 p-3 rounded-xl border border-gray-800/50 w-full sm:w-auto">
                    <p className="flex items-center text-sm text-placeholder">
                      Runner: <span className="font-bold text-white ml-2">{txn.runnerName}</span>
                    </p>
                    <p className="mt-2 flex items-center text-sm text-placeholder sm:mt-0">
                      Amount: <span className="font-bold text-primary ml-2">KES {txn.amount}</span>
                    </p>
                    <p className="mt-2 flex items-center text-sm text-placeholder sm:mt-0">
                      Type: <span className="font-bold text-white ml-2 bg-gray-800 px-2 py-0.5 rounded text-xs">{txn.type.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500 sm:mt-0 sm:self-end">
                    <p>
                      Initiated on <time dateTime={txn.date} className="font-medium text-gray-400">{txn.date}</time>
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
