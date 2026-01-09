import React, { useState } from 'react';
import { Camera, MapPin, Instagram, User, AtSign, Phone, Calendar, MapPinned, Briefcase } from 'lucide-react';
import { Profile } from '@/types';

interface BasicsSectionProps {
  profile: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

const CERTIFICATIONS = [
  'Personal Trainer',
  'Group Fitness Instructor',
  'Pilates Instructor',
  'Yoga Instructor',
  'CrossFit Coach',
  'Hyrox Coach',
  'Reformer Pilates Instructor',
  'Strength & Conditioning Coach',
  'Olympic Weightlifting Coach',
  'Running/Endurance Coach',
  'Cycling/Spinning Instructor',
  'Aqua Fitness Instructor',
  'Pre/Postnatal Fitness Specialist',
  'Rehab/Mobility Specialist',
];

const FITNESS_STYLES = {
  'Strength & Conditioning': [
    'HIIT',
    'Strength Training',
    'Functional Training',
    'CrossFit',
    'Olympic Weightlifting',
    'Kettlebell Training',
    'Calisthenics / Bodyweight',
  ],
  'Mind-Body & Recovery': [
    'Yoga',
    'Hot Yoga',
    'Pilates (Mat)',
    'Reformer Pilates / Megaformer (Lagree)',
    'Breathwork',
  ],
  'Dance & Music-Driven': [
    'Barre',
    'Dance Fitness (Latin, Afrobeat, Hip-Hop, etc.)',
    'Step Aerobics',
    'Pole Fitness / Aerial',
  ],
  'Endurance & Cardio': [
    'Spinning (classic)',
    'Rhythm Ride / Cycle (music-based)',
    'Running Coaching',
    'Aqua Fitness',
    'Bootcamp / Outdoor Conditioning',
  ],
  'Special Populations & Wellness': [
    'Senior Fitness',
    'Pre/Postnatal Fitness',
    'Rehab / Corrective Exercise',
    'Adaptive Fitness (injury or disability support)',
  ],
  'Regional / Trend-Specific (Scandinavia & Nordics)': [
    'Nordic Strong',
    'Ski / Snow Conditioning',
    'Sauna Master',
    'Outdoor / Nature Fitness',
  ],
};

export default function BasicsSection({ profile, onChange }: BasicsSectionProps) {
  const [photoPreview, setPhotoPreview] = useState(profile.profile_photo || '');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        setPhotoPreview(preview);
        onChange({ profile_photo: preview });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: keyof Profile, value: any) => {
    onChange({ [field]: value } as Partial<Profile>);
  };

  const toggleCertification = (cert: string) => {
    const currentCerts = profile.certifications || [];
    const updated = currentCerts.includes(cert)
      ? currentCerts.filter(c => c !== cert)
      : [...currentCerts, cert];
    handleInputChange('certifications', updated);
  };

  const toggleFitnessStyle = (style: string) => {
    const currentStyles = profile.fitness_styles || [];
    const updated = currentStyles.includes(style)
      ? currentStyles.filter(s => s !== style)
      : [...currentStyles, style];
    handleInputChange('fitness_styles', updated);
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const firstName = profile.full_name?.split(' ')[0] || '';
  const lastName = profile.full_name?.split(' ').slice(1).join(' ') || '';

  return (
    <section className="scroll-mt-24" id="basics">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold">1</span>
        Profile Details
      </h2>

      <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
        <p className="text-sm text-slate-500">The more information you provide, the easier it is for studios to find you</p>
        
        {/* Profile Photo */}
        <div className="pb-8 border-b border-slate-100 dark:border-slate-800">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">Profile Photo</label>
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-emerald-100 dark:border-emerald-900/50 bg-slate-100 dark:bg-slate-800 shadow-lg">
                {photoPreview ? (
                  <div 
                    className="h-full w-full bg-cover bg-center transition-transform group-hover:scale-105"
                    style={{ backgroundImage: `url(${photoPreview})` }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User size={32} className="text-slate-300 dark:text-slate-600" />
                  </div>
                )}
              </div>
              <label 
                htmlFor="photo-upload" 
                className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-emerald-600 transition-colors"
              >
                <Camera size={16} />
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload a professional photo for your profile</p>
              <p className="text-xs text-slate-500 mt-1">Max 5MB • JPG, PNG</p>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Headline <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500 mt-1">This appears in search results — make it catchy!</p>
          </div>
          <input
            type="text"
            value={profile.headline || ''}
            onChange={(e) => handleInputChange('headline', e.target.value)}
            placeholder="e.g. Spin + HIIT Coach | Available Weekday Mornings"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
          <p className={`text-xs ${(profile.headline?.length || 0) < 10 ? 'text-amber-500' : 'text-slate-400'}`}>
            {profile.headline?.length || 0}/10 characters minimum
          </p>
        </div>

        {/* Full Name */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={profile.full_name || ''}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            placeholder="John Doe"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Location */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={profile.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter your city or address"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        {/* Contact Number (Private) */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contact Number (Private)</label>
            <p className="text-xs text-slate-500 mt-1">Not visible to studios</p>
          </div>
          <div className="relative">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              value={profile.contact_number || ''}
              onChange={(e) => handleInputChange('contact_number', e.target.value)}
              placeholder="(123) 456-7890"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date of Birth</label>
            <p className="text-xs text-slate-500 mt-1">You must be at least 16 years old</p>
          </div>
          <div className="relative">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value);
                const age = calculateAge(selectedDate);
                if (age >= 16) {
                  handleInputChange('date_of_birth', selectedDate);
                } else {
                  alert('You must be at least 16 years old');
                }
              }}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-11 pr-4 py-3 text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        {/* Willing to travel */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Willing to travel?</label>
          <select
            value={profile.travel_preference || ''}
            onChange={(e) => handleInputChange('travel_preference', e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          >
            <option value="">Select</option>
            <option value="no">No</option>
            <option value="5km">Up to 5km</option>
            <option value="10km">Up to 10km</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        {/* Postal Code */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Postal Code (Optional)</label>
            <p className="text-xs text-slate-500 mt-1">Used for matching with nearby studios</p>
          </div>
          <div className="relative">
            <MapPinned size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={profile.postal_code || ''}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              placeholder="Enter your postal code"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        {/* Open to Work */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <input
            type="checkbox"
            id="open-to-work"
            checked={profile.open_to_work || false}
            onChange={(e) => handleInputChange('open_to_work', e.target.checked)}
            className="h-5 w-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="open-to-work" className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 cursor-pointer flex items-center gap-2">
            <Briefcase size={18} />
            I am open to work opportunities
          </label>
        </div>

        {/* Bio */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bio</label>
            <span className={`text-xs font-medium ${(profile.bio?.length || 0) < 60 ? 'text-amber-500' : 'text-slate-400'}`}>
              {profile.bio?.length || 0}/60 characters minimum
            </span>
          </div>
          <textarea
            value={profile.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell studios about your experience and teaching style..."
            rows={4}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
          />
        </div>

        {/* Certifications */}
        <div className="space-y-4 pt-8 border-t border-slate-100 dark:border-slate-800">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Certifications</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CERTIFICATIONS.map((cert) => (
              <label
                key={cert}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  (profile.certifications || []).includes(cert)
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={(profile.certifications || []).includes(cert)}
                  onChange={() => toggleCertification(cert)}
                  className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cert}</span>
              </label>
            ))}
          </div>

          {/* Other Certifications */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">Other Certifications (Optional)</label>
            <input
              type="text"
              value={profile.other_certifications || ''}
              onChange={(e) => handleInputChange('other_certifications', e.target.value)}
              placeholder="List any additional certifications"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        {/* Fitness Styles */}
        <div className="space-y-4 pt-8 border-t border-slate-100 dark:border-slate-800">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Fitness Styles</label>
          {Object.entries(FITNESS_STYLES).map(([category, styles]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {styles.map((style) => (
                  <label
                    key={style}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      (profile.fitness_styles || []).includes(style)
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(profile.fitness_styles || []).includes(style)}
                      onChange={() => toggleFitnessStyle(style)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{style}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Referral Source */}
        <div className="space-y-3 pt-8 border-t border-slate-100 dark:border-slate-800">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Who referred you to FitGig?</label>
          <input
            type="text"
            value={profile.referral_source || ''}
            onChange={(e) => handleInputChange('referral_source', e.target.value)}
            placeholder="Instagram, Jane S., Facebook, etc."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>
    </section>
  );
}
