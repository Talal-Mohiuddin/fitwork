import React, { useState } from 'react';
import { X, Plus, Check, Sparkles } from 'lucide-react';
import { Profile } from '@/types';

interface OfferingsSectionProps {
  profile: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

const availableStyles = [
  'Yoga',
  'Pilates',
  'HIIT',
  'Spin / Cycle',
  'Barre',
  'Boxing',
  'CrossFit',
  'Strength Training',
];

const availableAmenities = [
  'Showers',
  'Lockers',
  'Towel Service',
  'Smoothie Bar',
  'Parking',
  'Bike Storage',
  'WiFi',
  'Sauna',
];

export default function OfferingsSection({ profile, onChange }: OfferingsSectionProps) {
  const selectedStyles = profile.styles || ['Yoga', 'Pilates'];
  const selectedAmenities = profile.amenities || ['Lockers'];
  const [customStyle, setCustomStyle] = useState('');

  const toggleStyle = (style: string) => {
    const updated = selectedStyles.includes(style)
      ? selectedStyles.filter(s => s !== style)
      : [...selectedStyles, style];
    onChange({ styles: updated });
  };

  const toggleAmenity = (amenity: string) => {
    const updated = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity];
    onChange({ amenities: updated });
  };

  const addCustomStyle = () => {
    if (customStyle.trim() && !selectedStyles.includes(customStyle)) {
      onChange({ styles: [...selectedStyles, customStyle] });
      setCustomStyle('');
    }
  };

  return (
    <section className="p-8 scroll-mt-24" id="offerings">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-text-main dark:text-white">
        <Sparkles size={20} className="text-primary" />
        Class Styles & Amenities
      </h2>

      {/* Class Types */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-3 text-text-main dark:text-white">
          Class Types Offered
        </label>
        <div className="flex flex-wrap gap-3 mb-4">
          {selectedStyles.map(style => (
            <button
              key={style}
              className="px-4 py-2 rounded-full border border-primary bg-primary/10 text-primary-dark dark:text-primary font-medium text-sm transition-all flex items-center gap-2"
              type="button"
            >
              {style}
              <X size={16} className="cursor-pointer" onClick={() => toggleStyle(style)} />
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {availableStyles
            .filter(style => !selectedStyles.includes(style))
            .map(style => (
              <button
                key={style}
                onClick={() => toggleStyle(style)}
                className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#15241b] text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary text-sm transition-all"
                type="button"
              >
                {style}
              </button>
            ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              placeholder="Custom style"
              className="px-3 py-2 rounded-lg bg-background-light dark:bg-[#15241b] border-transparent focus:border-primary focus:ring-0 text-sm text-text-main dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && addCustomStyle()}
            />
            <button
              onClick={addCustomStyle}
              className="px-3 py-2 rounded-full border-dashed border border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 text-sm flex items-center gap-1 transition-all"
              type="button"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium mb-4 text-text-main dark:text-white">
          Member Amenities
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {availableAmenities.map(amenity => (
            <label
              key={amenity}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#15241b] cursor-pointer transition-colors group"
            >
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 dark:border-gray-600 checked:bg-primary checked:border-primary transition-all"
                />
                {selectedAmenities.includes(amenity) && (
                  <Check size={16} className="absolute text-black pointer-events-none left-[2px]" />
                )}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-text-main dark:group-hover:text-white">
                {amenity}
              </span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
