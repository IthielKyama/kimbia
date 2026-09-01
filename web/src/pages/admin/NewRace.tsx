import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NumberInput } from '../../components/NumberInput';
import { DatePicker } from '../../components/DatePicker';

export function NewRace() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isPending = role === 'RACE_ADMIN_PENDING';

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    distance: '',
    fee: '',
    description: ''
  });

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent, action: 'DRAFT' | 'PUBLISH') => {
    e.preventDefault();
    setError('');

    if (action === 'PUBLISH') {
      if (!formData.name) return setError('Race name is required.');
      if (!formData.date) return setError('Race date is required.');
      if (!formData.fee) return setError('Registration fee is required.');
      if (!formData.distance) return setError('Distance is required.');
      
      if (isPending) {
        alert("You cannot publish races until your account is approved.");
        return;
      }
    }
    
    console.log("Saving race:", formData, action);
    navigate('/races');
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
              <label htmlFor="distance" className="block text-sm font-medium text-gray-300">Distances (comma separated)</label>
              <div className="mt-2">
                <input
                  type="text"
                  name="distance"
                  id="distance"
                  value={formData.distance}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-700 rounded-xl border p-3 bg-background text-white placeholder-gray-600"
                  placeholder="e.g. 5km, 10km, 21km"
                />
              </div>
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
          
          <div className="mt-2 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-700 border-dashed rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer bg-background">
            <div className="space-y-2 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-500" />
              <div className="flex text-sm text-gray-400 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-bold text-primary hover:text-primary/80 focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG or JPG up to 5MB</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/races')}
            className="bg-background py-2.5 px-5 border border-gray-700 rounded-xl shadow-sm text-sm font-bold text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'DRAFT')}
            className="bg-primary/10 py-2.5 px-5 border border-primary/30 rounded-xl shadow-sm text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'PUBLISH')}
            disabled={isPending}
            className={`py-2.5 px-5 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-opacity
              ${isPending ? 'bg-gray-700 cursor-not-allowed opacity-50' : 'bg-primary hover:opacity-90'}
            `}
            title={isPending ? "You must be approved to publish races" : ""}
          >
            Publish Race
          </button>
        </div>
      </form>
    </div>
  );
}
