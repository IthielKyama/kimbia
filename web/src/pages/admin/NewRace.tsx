import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check, UploadCloud, X, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
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

export function NewRace() {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bib Template Upload State
  const [bibTemplateUrl, setBibTemplateUrl] = useState<string>('');
  const [isUploadingBib, setIsUploadingBib] = useState<boolean>(false);
  const [bibUploadError, setBibUploadError] = useState<string>('');
  const [bibFileName, setBibFileName] = useState<string>('');

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setBibUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setBibUploadError('File size exceeds the 10MB limit.');
      return;
    }

    setBibUploadError('');
    setIsUploadingBib(true);
    setBibFileName(file.name);

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await apiClient.post('/api/uploads', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data?.file_url) {
        setBibTemplateUrl(res.data.file_url);
      }
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to upload bib template';
      setBibUploadError(errMsg);
    } finally {
      setIsUploadingBib(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

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

  const handleSubmit = async (e: React.FormEvent, action: 'DRAFT' | 'PUBLISH') => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('Race name is required.');
    if (!formData.date.trim()) return setError('Race date is required.');
    if (!formData.fee || Number(formData.fee) < 0) return setError('A valid registration fee is required.');
    if (selectedDistances.length === 0) return setError('Please select at least one race distance.');

    if (action === 'PUBLISH' && isPending) {
      return setError('You cannot publish races until your account is approved by a Super Admin.');
    }

    setIsSubmitting(true);
    try {
      const raceDateFormatted = formData.date.includes('T') ? formData.date : `${formData.date}T08:00:00`;
      const payload = {
        name: formData.name.trim(),
        distance: selectedDistances.join(', '),
        race_date: raceDateFormatted,
        fee: parseFloat(formData.fee) || 0,
        description: formData.description.trim() || undefined,
        bib_template_url: bibTemplateUrl || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80',
      };

      const res = await apiClient.post('/api/races', payload);
      const createdRaceId = res.data.id;

      if (action === 'PUBLISH') {
        await apiClient.put(`/api/races/${createdRaceId}/status`, { status: 'PUBLISHED' });
      }

      await queryClient.invalidateQueries({ queryKey: ['races'] });
      navigate('/races');
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to save race. Please try again.';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-geist">
      <h1 className="text-2xl font-bold text-white font-outfit">Create New Race</h1>

      <form className="space-y-8 bg-surface p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-800" noValidate>
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
            {error}
          </div>
        )}
        {/* Basic Info */}
        <div className="space-y-6 border-b border-gray-800 pb-8">
          <h2 className="text-lg font-bold text-white font-outfit">Race Details</h2>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">Race Name</label>
              <div className="mt-2">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-700 rounded-xl border p-3 bg-background text-white placeholder-gray-600"
                  placeholder="e.g. Nairobi City Marathon 2024"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="date" className="block text-sm font-medium text-gray-300">Race Date</label>
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
              <label htmlFor="fee" className="block text-sm font-medium text-gray-300">Registration Fee (KES)</label>
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

            <div className="sm:col-span-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Race Distances <span className="text-primary">*</span>
                </label>
                <span className="text-xs text-placeholder">Select one or more distance categories</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
            
            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
              <div className="mt-2">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-700 rounded-xl border p-3 bg-background text-white placeholder-gray-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bib Upload */}
        <div className="space-y-6 pt-2">
          <div>
            <h2 className="text-lg font-bold text-white font-outfit">Base Digital Bib Template</h2>
            <p className="mt-1 text-sm text-placeholder">
              Upload the base image for the digital bib. The system will dynamically overlay the runner's name and bib number.
            </p>
          </div>

          {bibUploadError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{bibUploadError}</span>
            </div>
          )}

          {bibTemplateUrl ? (
            <div className="bg-background border border-gray-700 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-48 h-32 rounded-lg overflow-hidden border border-gray-800 bg-surface flex-shrink-0 relative">
                <img
                  src={bibTemplateUrl}
                  alt="Bib Template Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-1.5 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-primary text-xs font-bold">
                  <Check size={14} />
                  <span>Custom Template Uploaded</span>
                </div>
                <p className="text-white text-sm font-medium truncate max-w-xs">{bibFileName || 'bib-template.png'}</p>
                <p className="text-placeholder text-xs">This image will be used to generate personalized digital bibs for registered runners.</p>
                <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                  <label
                    htmlFor="file-upload-replace"
                    className="cursor-pointer text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    Change Image
                    <input
                      id="file-upload-replace"
                      name="file-upload-replace"
                      type="file"
                      className="sr-only"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileInputChange}
                    />
                  </label>
                  <span className="text-gray-600">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setBibTemplateUrl('');
                      setBibFileName('');
                    }}
                    className="cursor-pointer text-xs font-bold text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <X size={12} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`mt-2 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-700 border-dashed rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer bg-background ${
                isUploadingBib ? 'opacity-70 pointer-events-none' : ''
              }`}
            >
              <div className="space-y-2 text-center">
                {isUploadingBib ? (
                  <>
                    <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                    <p className="text-sm font-bold text-white">Uploading bib template...</p>
                    <p className="text-xs text-placeholder">Please wait while the image is being saved</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
                    <div className="flex text-sm text-gray-400 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-bold text-primary hover:text-primary/80 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleFileInputChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, or WEBP up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/races')}
            disabled={isSubmitting}
            className="bg-background py-2.5 px-5 border border-gray-700 rounded-xl shadow-sm text-sm font-bold text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'DRAFT')}
            disabled={isSubmitting}
            className="inline-flex items-center bg-primary/10 py-2.5 px-5 border border-primary/30 rounded-xl shadow-sm text-sm font-bold text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" /> Saving...
              </>
            ) : (
              'Save as Draft'
            )}
          </button>
          <Tooltip content={isPending ? "You must be approved by Super Admin to publish races" : ""}>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'PUBLISH')}
              disabled={isPending || isSubmitting}
              className={`inline-flex items-center py-2.5 px-5 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-opacity
                ${isPending || isSubmitting ? 'bg-gray-700 cursor-not-allowed opacity-50' : 'bg-primary hover:opacity-90'}
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" /> Publishing...
                </>
              ) : (
                'Publish Race'
              )}
            </button>
          </Tooltip>
        </div>
      </form>
    </div>
  );
}
