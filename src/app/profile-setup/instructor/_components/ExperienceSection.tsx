import React, { useState } from 'react';
import { Trash2, Briefcase, Plus, Building2, Calendar, Edit2, X, Check, GripVertical } from 'lucide-react';
import { Profile, Experience } from '@/types';

interface ExperienceSectionProps {
  profile: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

interface ExperienceFormData {
  company: string;
  title: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isCurrentRole: boolean;
  description: string;
}

const emptyForm: ExperienceFormData = {
  company: '',
  title: '',
  startMonth: '',
  startYear: '',
  endMonth: '',
  endYear: '',
  isCurrentRole: false,
  description: '',
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

export default function ExperienceSection({ profile, onChange }: ExperienceSectionProps) {
  const experiences = profile.experience || [];
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ExperienceFormData>(emptyForm);

  const handleSaveExperience = () => {
    if (!formData.company || !formData.title || !formData.startYear) return;

    const experience: Experience = {
      company: formData.company,
      title: formData.title,
      period: formatPeriod(formData),
      isActive: formData.isCurrentRole,
    };

    if (editingIndex !== null) {
      const updated = [...experiences];
      updated[editingIndex] = experience;
      onChange({ experience: updated });
      setEditingIndex(null);
    } else {
      onChange({ experience: [...experiences, experience] });
      setIsAdding(false);
    }
    
    setFormData(emptyForm);
  };

  const formatPeriod = (data: ExperienceFormData) => {
    const start = data.startMonth ? `${data.startMonth} ${data.startYear}` : data.startYear;
    const end = data.isCurrentRole 
      ? 'Present' 
      : data.endMonth ? `${data.endMonth} ${data.endYear}` : data.endYear || 'Present';
    return `${start} - ${end}`;
  };

  const handleEditExperience = (index: number) => {
    const exp = experiences[index];
    const [startPart, endPart] = exp.period.split(' - ');
    const startParts = startPart.split(' ');
    const endParts = endPart?.split(' ') || [];
    
    setFormData({
      company: exp.company,
      title: exp.title,
      startMonth: startParts.length > 1 ? startParts[0] : '',
      startYear: startParts.length > 1 ? startParts[1] : startParts[0],
      endMonth: endParts.length > 1 && endParts[0] !== 'Present' ? endParts[0] : '',
      endYear: endParts.length > 1 ? endParts[1] : endParts[0] !== 'Present' ? endParts[0] : '',
      isCurrentRole: exp.isActive || endPart === 'Present',
      description: '',
    });
    setEditingIndex(index);
    setIsAdding(false);
  };

  const handleDeleteExperience = (index: number) => {
    onChange({ experience: experiences.filter((_, i) => i !== index) });
    if (editingIndex === index) {
      setEditingIndex(null);
      setFormData(emptyForm);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setFormData(emptyForm);
  };

  const renderForm = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 p-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-bold text-slate-900 dark:text-white">
          {editingIndex !== null ? 'Edit Experience' : 'Add New Experience'}
        </h4>
        <button
          onClick={handleCancel}
          type="button"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="grid gap-5">
        {/* Company & Role */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Studio / Company <span className="text-emerald-500">*</span>
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. SoulCycle"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Role / Title <span className="text-emerald-500">*</span>
            </label>
            <div className="relative">
              <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Lead Instructor"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Duration <span className="text-emerald-500">*</span>
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Start Date</span>
              <div className="flex gap-2">
                <select
                  value={formData.startMonth}
                  onChange={(e) => setFormData({ ...formData, startMonth: e.target.value })}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="">Month</option>
                  {months.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
                <select
                  value={formData.startYear}
                  onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="">Year *</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider">End Date</span>
              <div className="flex gap-2">
                <select
                  value={formData.endMonth}
                  onChange={(e) => setFormData({ ...formData, endMonth: e.target.value })}
                  disabled={formData.isCurrentRole}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Month</option>
                  {months.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
                <select
                  value={formData.endYear}
                  onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                  disabled={formData.isCurrentRole}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Current Role Toggle */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.isCurrentRole}
                onChange={(e) => setFormData({ ...formData, isCurrentRole: e.target.checked, endMonth: '', endYear: '' })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 rounded-full bg-slate-200 dark:bg-slate-700 peer-checked:bg-emerald-500 transition-colors" />
              <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              I currently work here
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleCancel}
            type="button"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveExperience}
            type="button"
            disabled={!formData.company || !formData.title || !formData.startYear}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25"
          >
            <Check size={16} />
            {editingIndex !== null ? 'Update' : 'Add Experience'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="scroll-mt-24" id="experience">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm font-bold">2</span>
        Work Experience
      </h2>

      <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        {/* Experience Timeline */}
        {experiences.length > 0 && (
          <div className="mb-6 space-y-4">
            {experiences.map((exp, idx) => (
              <div 
                key={idx} 
                className={`relative group ${editingIndex === idx ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {/* Timeline connector */}
                {idx < experiences.length - 1 && (
                  <div className="absolute left-5 top-14 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
                )}
                
                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    exp.isActive 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <Briefcase size={18} />
                  </div>
                  
                  {/* Content Card */}
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 dark:text-white">{exp.title}</h4>
                          {exp.isActive && (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{exp.company}</p>
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                          <Calendar size={12} />
                          <span>{exp.period}</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditExperience(idx)}
                          type="button"
                          className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteExperience(idx)}
                          type="button"
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Form */}
        {(isAdding || editingIndex !== null) && renderForm()}

        {/* Add Button */}
        {!isAdding && editingIndex === null && (
          <button
            onClick={() => setIsAdding(true)}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 flex items-center justify-center transition-colors">
              <Plus size={18} className="group-hover:text-emerald-600" />
            </div>
            <span className="font-semibold">Add Work Experience</span>
          </button>
        )}

        {/* Empty State */}
        {experiences.length === 0 && !isAdding && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Briefcase size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No experience added yet</h3>
            <p className="text-sm text-slate-500 mb-6">Add your teaching experience to attract more studios</p>
          </div>
        )}
      </div>
    </section>
  );
}
