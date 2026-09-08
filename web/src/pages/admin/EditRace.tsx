import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Loader2, Check, AlertCircle, Info, Trophy, Calendar, Tag } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { NumberInput } from '../../components/NumberInput';
import { DatePicker } from '../../components/DatePicker';
import { Tooltip } from '../../components/Tooltip';
import apiClient from '../../services/apiClient';

const SELECTABLE_DISTANCES = [
  { value: '5K', label: '5K', desc: '5 Kilometers' },
  { value: '10K', label: '10K', desc: '10 Kilometers' },
  { value: '15K', label: '15K', desc: '15 Kilometers' },
  { value: '21.1K', label: '21.1K', desc: 'Half Marathon' },
  { value: '42.2K', label: '42.2K', desc: 'Full Marathon' },
  { value: '50K', label: '50K', desc: 'Ultra Marathon' },
];

export function EditRace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const isPending = role === 'RACE_ADMIN_PENDING';

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    fee: '',
    description: ''
  });
  const [selectedDistances, setSelectedDistances] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: race, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['race', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/races/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['race-registrations', id],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/api/admin/races/${id}/registrations`);
        return res.data;
      } catch {
        return [];
      }
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (race) {
      let formattedDate = '';
      if (race.raceDate) {
        try {
          formattedDate = race.raceDate.split('T')[0];
        } catch {
          formattedDate = race.raceDate;
        }
      }

      setFormData({
        name: race.name || '',
        date: formattedDate,
        fee: race.fee !== undefined ? String(race.fee) : '',
        description: race.description || ''
      });

      if (race.distance) {
        const parts = race.distance.split(',').map((s: string) => s.trim()).filter(Boolean);
        setSelectedDistances(parts);
      }
    }
  }, [race]);

  const toggleDistance = (value: string) => {
    setSelectedDistances((prev) => {
      let updated: string[];
      if (prev.includes(value)) {
        updated = prev.filter((d) => d !== value);
      } else {
        const newSet = new Set([...prev, value]);
        updated = SELECTABLE_DISTANCES.map((d) => d.value).filter((val) => newSet.has(val));
      }
      return updated;
    });
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const updateMutation = useMutation({
    mutationFn: async (action: 'DRAFT' | 'PUBLISH') => {
      setError('');
      setSuccessMsg('');

      if (!formData.name.trim()) throw new Error('Race name is required.');
      if (!formData.date.trim()) throw new Error('Race date is required.');
      if (!formData.fee || Number(formData.fee) < 0) throw new Error('A valid registration fee is required.');
      if (selectedDistances.length === 0) throw new Error('Please select at least one race distance.');

      if (action === 'PUBLISH' && isPending) {
        throw new Error('You cannot publish races until your organizer account is approved by a Super Admin.');
      }

      const raceDateFormatted = formData.date.includes('T') ? formData.date : `${formData.date}T08:00:00`;
      const payload = {
        name: formData.name.trim(),
        distance: selectedDistances.join(', '),
        race_date: raceDateFormatted,
        fee: parseFloat(formData.fee) || 0,
        description: formData.description.trim() || undefined,
      };

      const res = await apiClient.put(`/api/races/${id}`, payload);

      if (action === 'PUBLISH') {
        await apiClient.put(`/api/races/${id}/status`, { status: 'PUBLISHED' });
      }

      return res.data;
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ['races'] });
      queryClient.invalidateQueries({ queryKey: ['race', id] });
      setSuccessMsg(action === 'PUBLISH' ? 'Race updated and published successfully!' : 'Draft changes saved successfully!');
      setTimeout(() => {
        navigate('/races');
      }, 1200);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update race';
      setError(msg);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center font-geist">
        <div className="flex flex-col items-center gap-3 text-placeholder">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm">Loading race details...</p>
        </div>
      </div>
    );
  }

  if (isError || !race) {
    return (
      <div className="space-y-6 font-geist w-full">
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <div className="flex items-center gap-3">
            <AlertCircle size={22} />
            <h2 className="text-lg font-bold font-outfit">Failed to Load Race</h2>
          </div>
          <p className="text-sm mt-2">{(queryError as any)?.message || 'The requested race could not be found or you do not have permission to view it.'}</p>
          <Link
            to="/races"
            className="inline-flex items-center mt-4 px-4 py-2 border border-gray-700 rounded-xl text-sm font-bold text-white bg-surface hover:bg-gray-800"
          >
            <ChevronLeft size={16} className="mr-1" /> Back to My Races
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-geist w-full pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/races"
            className="p-2 text-placeholder hover:text-white rounded-lg hover:bg-surface transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white font-outfit">Edit Race</h1>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                race.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                race.status === 'CLOSED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                'bg-gray-500/10 text-gray-400 border-gray-500/20'
              }`}>
                {race.status}
              </span>
            </div>
            <p className="text-sm text-placeholder mt-0.5">
              Make changes to your race details and distance categories
            </p>
          </div>
        </div>
      </div>

      {isPending && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 flex items-start gap-3">
          <Info size={20} className="flex-shrink-0 mt-0.5 text-yellow-400" />
          <div className="text-sm">
            <p className="font-bold">Organizer Account Pending KYC Approval</p>
            <p className="text-xs text-yellow-400/80 mt-0.5">
              You can edit and save your race drafts freely. Publishing races requires approval by a Super Admin.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center gap-3">
          <Check size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      <form className="w-full" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface shadow-lg sm:rounded-xl border border-gray-800 p-6 space-y-6">
              <h2 className="text-base font-bold text-white font-outfit border-b border-gray-800 pb-3">
                Race Information
              </h2>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Race Name */}
                <div className="sm:col-span-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Race Name <span className="text-primary">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-700 rounded-xl border p-3 bg-background text-white placeholder-gray-600 font-geist"
                      placeholder="e.g. Nairobi City Marathon 2026"
                    />
                  </div>
                </div>

                {/* Date & Fee */}
                <div className="sm:col-span-3">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-300">
                    Race Date <span className="text-primary">*</span>
                  </label>
                  <div className="mt-2">
                    <DatePicker
                      name="date"
                      id="date"
                      value={formData.date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="fee" className="block text-sm font-medium text-gray-300">
                    Registration Fee (KES) <span className="text-primary">*</span>
                  </label>
                  <div className="mt-2">
                    <NumberInput
                      name="fee"
                      id="fee"
                      value={formData.fee}
                      onChange={handleChange}
                      placeholder="0.00"
                      step={100}
                      prefixNode="KES"
                    />
                  </div>
                </div>

                {/* Distances (Multi-select) */}
                <div className="sm:col-span-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Race Distances <span className="text-primary">*</span>
                    </label>
                    <span className="text-xs text-placeholder">Select one or more distance categories</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SELECTABLE_DISTANCES.map((opt) => {
                      const isSelected = selectedDistances.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleDistance(opt.value)}
                          className={`relative p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center group ${
                            isSelected
                              ? 'bg-primary/10 border-primary text-white ring-1 ring-primary shadow-lg shadow-primary/10'
                              : 'bg-background border-gray-700/80 text-gray-300 hover:border-gray-500 hover:bg-surface/60'
                          }`}
                        >
                          <div
                            className={`absolute top-2 right-2 w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-primary border-primary text-white'
                                : 'border-gray-600 bg-surface/50 group-hover:border-gray-400'
                            }`}
                          >
                            {isSelected && <Check size={11} strokeWidth={3} />}
                          </div>
                          <span className={`text-lg font-bold font-outfit ${isSelected ? 'text-primary' : 'text-white group-hover:text-white'}`}>
                            {opt.label}
                          </span>
                          <span className="text-[11px] text-gray-400 mt-1 font-geist whitespace-nowrap">
                            {opt.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedDistances.length > 0 ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span>Selected Categories ({selectedDistances.length}):</span>
                      {selectedDistances.map((dist) => (
                        <span
                          key={dist}
                          className="font-bold text-primary px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-1.5"
                        >
                          {dist}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDistance(dist);
                            }}
                            className="text-primary hover:text-white cursor-pointer ml-0.5 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-placeholder mt-2">Select all distance categories that runners can choose from for this event.</p>
                  )}
                </div>

                {/* Description */}
                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                    Description
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-700 rounded-xl border p-3 bg-background text-white placeholder-gray-600 font-geist"
                      placeholder="Provide any key race instructions, routes, or details..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 Column) - Status, Summary, and Quick Actions */}
          <div className="space-y-6">
            {/* Status & Actions Card */}
            <div className="bg-surface shadow-lg sm:rounded-xl border border-gray-800 p-6 space-y-5">
              <h2 className="text-base font-bold text-white font-outfit border-b border-gray-800 pb-3">
                Publishing & Actions
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-placeholder font-medium">Status</span>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                    race.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    race.status === 'CLOSED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }`}>
                    {race.status}
                  </span>
                </div>
                <p className="text-xs text-placeholder leading-relaxed">
                  {race.status === 'DRAFT'
                    ? 'This race is currently saved as a draft. You can edit it freely before making it public.'
                    : race.status === 'PUBLISHED'
                    ? 'This race is published and accepting runner registrations.'
                    : 'This race has been marked as closed.'}
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => updateMutation.mutate('DRAFT')}
                  disabled={updateMutation.isPending}
                  className="w-full py-3 px-4 border border-gray-700 rounded-xl shadow-sm text-sm font-bold text-white bg-background hover:bg-gray-800 hover:border-gray-600 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" /> Saving Changes...
                    </>
                  ) : (
                    'Save Draft Changes'
                  )}
                </button>

                {race.status === 'DRAFT' && (
                  <Tooltip content={isPending ? "You must be approved by Super Admin to publish races" : ""}>
                    <button
                      type="button"
                      onClick={() => updateMutation.mutate('PUBLISH')}
                      disabled={isPending || updateMutation.isPending}
                      className={`w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all flex items-center justify-center ${
                        isPending || updateMutation.isPending
                          ? 'bg-gray-700 cursor-not-allowed opacity-50'
                          : 'bg-primary hover:opacity-90 cursor-pointer shadow-lg shadow-primary/20'
                      }`}
                    >
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin mr-2" /> Publishing...
                        </>
                      ) : (
                        'Publish Race'
                      )}
                    </button>
                  </Tooltip>
                )}

                <Link
                  to="/races"
                  className="w-full text-center py-2 px-4 text-xs font-semibold text-placeholder hover:text-white transition-colors"
                >
                  Cancel & Back to Races
                </Link>
              </div>
            </div>

            {/* Event Summary Overview Card */}
            <div className="bg-surface shadow-lg sm:rounded-xl border border-gray-800 p-6 space-y-4">
              <h2 className="text-base font-bold text-white font-outfit border-b border-gray-800 pb-3">
                Event Overview
              </h2>

              <div className="space-y-3.5 text-xs font-geist">
                <div className="flex items-center justify-between">
                  <span className="text-placeholder flex items-center gap-1.5">
                    <Trophy size={14} className="text-primary" /> Race ID
                  </span>
                  <span className="font-mono text-white font-bold">#{race.id}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-placeholder flex items-center gap-1.5">
                    <Calendar size={14} className="text-primary" /> Date
                  </span>
                  <span className="text-white font-medium">{formData.date || 'TBD'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-placeholder flex items-center gap-1.5">
                    <Tag size={14} className="text-primary" /> Fee
                  </span>
                  <span className="text-[#CCFF00] font-bold">KES {Number(formData.fee || 0).toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-placeholder">Registrations</span>
                  <span className="text-white font-bold">{registrations.length} runners</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800">
                <Link
                  to={`/races/${race.id}/leaderboard`}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-gray-700 rounded-xl text-xs font-bold text-gray-300 bg-background hover:bg-gray-800 hover:text-white transition-colors"
                >
                  View Leaderboard & Results →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
