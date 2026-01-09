import React, { useState } from 'react';
import { Upload, Award, Check, Trash2 } from 'lucide-react';
import { Profile, Certification } from '@/types';

interface CertificationsSectionProps {
  profile: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export default function CertificationsSection({ profile, onChange }: CertificationsSectionProps) {
  const certDetails = profile.certification_details || [];
  const [isUploading, setIsUploading] = useState(false);

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        const cert: Certification = {
          title: file.name.replace(/\.[^/.]+$/, ''),
          issued: new Date().toLocaleDateString(),
          icon: '📄',
        };
        onChange({ certification_details: [...certDetails, cert] });
        setIsUploading(false);
      }, 500);
    }
  };

  const handleDeleteCert = (index: number) => {
    onChange({ certification_details: certDetails.filter((_, i) => i !== index) });
  };

  return (
    <section className="scroll-mt-24" id="certs">
      <h2 className="text-2xl font-display font-bold text-text-main dark:text-white mb-6 flex items-center gap-3">
        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm">3</span>
        Certifications & Skills
      </h2>

      <div className="rounded-2xl border border-gray-200 bg-surface-light dark:bg-surface-dark dark:border-gray-800 p-8 shadow-sm">
        <div className="mb-8 grid gap-4">
          {certDetails.map((cert, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="p-2.5 bg-white dark:bg-surface-dark rounded-lg shadow-sm text-primary-dark dark:text-primary">
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-main dark:text-white flex items-center gap-2">
                    {cert.title}
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary-dark dark:text-primary">
                      <Check size={12} />
                      Verified
                    </span>
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">{cert.issued}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteCert(idx)}
                className="mt-2 sm:mt-0 text-xs font-bold text-red-500 hover:text-red-700"
                type="button"
              >
                Remove
              </button>
            </div>
          ))}

          <label className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/30 p-8 text-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-gray-700 shadow-sm">
              <Upload size={24} className="text-primary" />
            </div>
            <h3 className="text-sm font-bold text-text-main dark:text-white">Upload New Certification</h3>
            <p className="mt-1 text-xs text-text-secondary">Drag and drop or click to upload PDF/JPG</p>
            <input
              type="file"
              onChange={handleCertUpload}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
