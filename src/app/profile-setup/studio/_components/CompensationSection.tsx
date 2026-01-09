import React, { useState } from 'react';
import { Check, DollarSign, AlertCircle } from 'lucide-react';
import { Profile } from '@/types';

interface CompensationSectionProps {
  profile: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export default function CompensationSection({
  profile,
  onChange,
}: CompensationSectionProps) {
  const [minPay, setMinPay] = useState('');
  const [maxPay, setMaxPay] = useState('');
  const [payModel, setPayModel] = useState('Flat Rate');
  const [perks, setPerks] = useState(['Free Membership']);

  const togglePerk = (perk: string) => {
    setPerks(prev =>
      prev.includes(perk)
        ? prev.filter(p => p !== perk)
        : [...prev, perk]
    );
  };

  return (
    <section className="p-8 scroll-mt-24" id="compensation">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-text-main dark:text-white">
          <DollarSign size={20} className="text-primary" />
          Compensation & Perks
        </h2>
        <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-bold border border-green-200">
          High Priority
        </span>
      </div>

      {/* Info Alert */}
      <div className="bg-[#f0f9f4] dark:bg-[#15241b] border border-[#dbe6df] dark:border-[#2a4030] rounded-xl p-5 mb-8 flex items-start gap-3">
        <AlertCircle size={20} className="text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-text-main dark:text-white">Pay Transparency Signal</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Studios that display clear pay ranges get 3x more qualified applicants. This data will be shown on your public profile.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Pay Range */}
        <div>
          <label className="block text-sm font-medium mb-3 text-text-main dark:text-white">
            Base Pay Range (Per Class)
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
              <input
                type="number"
                value={minPay}
                onChange={(e) => setMinPay(e.target.value)}
                placeholder="Min"
                className="w-full pl-7 pr-4 py-2.5 rounded-lg bg-white dark:bg-[#1a2c20] border border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-0 text-sm placeholder-gray-400 dark:placeholder-gray-500 text-text-main dark:text-white"
              />
            </div>
            <span className="text-gray-400">-</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
              <input
                type="number"
                value={maxPay}
                onChange={(e) => setMaxPay(e.target.value)}
                placeholder="Max"
                className="w-full pl-7 pr-4 py-2.5 rounded-lg bg-white dark:bg-[#1a2c20] border border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-0 text-sm placeholder-gray-400 dark:placeholder-gray-500 text-text-main dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Pay Model */}
        <div>
          <label className="block text-sm font-medium mb-3 text-text-main dark:text-white">
            Pay Model
          </label>
          <select
            value={payModel}
            onChange={(e) => setPayModel(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-[#1a2c20] border border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-0 text-sm text-text-main dark:text-white"
          >
            <option>Flat Rate</option>
            <option>Base Rate + Headcount Bonus</option>
            <option>Revenue Share</option>
            <option>Experience Based</option>
          </select>
        </div>
      </div>

      {/* Perks */}
      <div>
        <label className="block text-sm font-medium mb-3 text-text-main dark:text-white">
          Additional Perks
        </label>
        <div className="flex flex-wrap gap-2">
          {['Free Membership', 'Guest Passes', 'Retail Discount', 'Health Benefits'].map(perk => (
            <label
              key={perk}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#15241b] text-sm cursor-pointer hover:border-primary transition-colors"
            >
              <input
                checked={perks.includes(perk)}
                onChange={() => togglePerk(perk)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
                type="checkbox"
              />
              {perk}
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
