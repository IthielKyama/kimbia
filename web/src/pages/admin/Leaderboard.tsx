import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { Trophy, Gift, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Select } from '../../components/Select';
import { NumberInput } from '../../components/NumberInput';

interface Runner {
  id: string;
  name: string;
  bib: string;
  time: string;
  category: string;
  gender: string;
  proofUrl?: string;
}

export function Leaderboard() {
  const { id } = useParams();
  const { role } = useAuth();
  const isPending = role === 'RACE_ADMIN_PENDING';

  const [runners] = useState<Runner[]>([
    { id: '1', name: 'Eliud K.', bib: '1001', time: '02:01:09', category: '42km', gender: 'M' },
    { id: '2', name: 'Mary K.', bib: '1002', time: '02:14:04', category: '42km', gender: 'F' },
    { id: '3', name: 'John D.', bib: '2005', time: '01:05:30', category: '21km', gender: 'M' },
  ]);

  const [selectedRunner, setSelectedRunner] = useState<Runner | null>(null);
  const [awardType, setAwardType] = useState<'AIRTIME' | 'MOBILE_MONEY'>('MOBILE_MONEY');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  
  const handleAward = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone) return setError('Please enter a phone number.');
    if (!amount) return setError('Please enter an amount.');

    if (isPending) {
      alert("You cannot distribute awards until your account is approved.");
      return;
    }
    console.log(`Distributing ${awardType} of ${amount} to ${phone} for runner ${selectedRunner?.name}`);
    alert(`Award transaction initiated via Tingg API. Status is PENDING.`);
    setSelectedRunner(null);
    setPhone('');
    setAmount('');
  };

  return (
    <div className="space-y-6 font-geist">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-outfit">Race Leaderboard</h1>
          <p className="text-sm text-placeholder">Race ID: {id}</p>
        </div>
      </div>

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
                  Time <ArrowUpDown size={14} className="ml-1" />
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Category
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-outfit">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {runners.map((runner, index) => (
                <tr key={runner.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                    {index === 0 && <Trophy className="inline text-yellow-500 mr-2" size={18} />}
                    {index === 1 && <Trophy className="inline text-gray-400 mr-2" size={18} />}
                    {index === 2 && <Trophy className="inline text-amber-600 mr-2" size={18} />}
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white">{runner.name}</div>
                    <div className="text-sm text-placeholder">Bib: {runner.bib}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono font-medium text-white bg-background/50 px-3 py-1 rounded-lg inline-block border border-gray-800">{runner.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {runner.category} ({runner.gender})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      type="button"
                      onClick={() => setSelectedRunner(runner)}
                      className="text-primary hover:text-primary/80 flex items-center font-bold bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                      <Gift size={16} className="mr-2" /> Award
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Award Modal */}
      {selectedRunner && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto font-geist" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setSelectedRunner(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-surface rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl border border-gray-800 transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 border border-primary/20">
                  <Gift className="h-7 w-7 text-primary" aria-hidden="true" />
                </div>
                <div className="mt-4 text-center sm:mt-5">
                  <h3 className="text-xl leading-6 font-bold text-white font-outfit" id="modal-title">
                    Distribute Award to {selectedRunner.name}
                  </h3>
                  <div className="mt-2 text-sm text-placeholder">
                    <p>Initiate a payout via the Tingg Postpayment API.</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleAward} className="mt-6 space-y-5 border-t border-gray-800 pt-5" noValidate>
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                    {error}
                  </div>
                )}
                <div className="relative z-20">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Award Type</label>
                  <Select
                    value={awardType}
                    onChange={(val) => setAwardType(val as any)}
                    options={[
                      { value: 'MOBILE_MONEY', label: 'Mobile Money Transfer' },
                      { value: 'AIRTIME', label: 'Airtime Top-up' }
                    ]}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
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
                    placeholder="0"
                    step={100}
                  />
                </div>
                
                {isPending && (
                   <p className="text-xs text-red-500 mt-2 text-center bg-red-500/10 p-2 rounded-lg">You must be approved by a Super Admin to distribute awards.</p>
                )}

                <div className="mt-6 sm:mt-8 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    disabled={isPending}
                    className={`w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-3 text-base font-bold text-white focus:outline-none transition-opacity sm:w-auto sm:text-sm
                      ${isPending ? 'bg-gray-700 cursor-not-allowed opacity-50' : 'bg-primary hover:opacity-90'}`}
                  >
                    Initiate Payout
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRunner(null);
                      setError('');
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-700 shadow-sm px-4 py-3 bg-background text-base font-bold text-gray-300 hover:bg-gray-800 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors"
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
