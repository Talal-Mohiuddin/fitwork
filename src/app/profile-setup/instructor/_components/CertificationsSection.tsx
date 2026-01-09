import React, { useState } from 'react';
import { Upload, Award, Check, Trash2, FileText, ShieldCheck, Plus } from 'lucide-react';
import { Profile, Certification } from '@/types';

interface CertificationsSectionProps {
  profile: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

const popularCertifications = [
  'ACE Personal Trainer',
  'NASM Certified',
  'AFAA Group Fitness',
  'Yoga Alliance RYT-200',
  'Pilates Mat Certification',
  'CrossFit Level 1',
  'Spinning Instructor',
  'Les Mills Certified',
];

export default function CertificationsSection({ profile, onChange }: CertificationsSectionProps) {
  const certDetails = profile.certification_details || [];
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCerts, setSelectedCerts] = useState<string[]>(
    certDetails.map(c => c.title)
  );

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        const cert: Certification = {
          title: file.name.replace(/\.[^/.]+$/, ''),
          issued: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          icon: '📄',
        };
        onChange({ certification_details: [...certDetails, cert] });
        setIsUploading(false);
      }, 800);
    }
  };

  const handleToggleCert = (certName: string) => {
    if (selectedCerts.includes(certName)) {
      setSelectedCerts(selectedCerts.filter(c => c !== certName));
      onChange({ 
        certification_details: certDetails.filter(c => c.title !== certName) 
      });
    } else {
      setSelectedCerts([...selectedCerts, certName]);
      const newCert: Certification = {
        title: certName,
        issued: 'Pending verification',
        icon: '🎓',
      };
      onChange({ certification_details: [...certDetails, newCert] });
    }
  };

  const handleDeleteCert = (index: number) => {
    const certToRemove = certDetails[index];
    setSelectedCerts(selectedCerts.filter(c => c !== certToRemove.title));
    onChange({ certification_details: certDetails.filter((_, i) => i !== index) });
  };

  return (
    <section className="scroll-mt-24" id="certs">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm font-bold">3</span>
        Certifications & Skills
      </h2>

      <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        {/* Quick Select Popular Certifications */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Quick Add Popular Certifications</h3>
          <div className="flex flex-wrap gap-2">
            {popularCertifications.map((cert) => (
              <button
                key={cert}
                type="button"
                onClick={() => handleToggleCert(cert)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCerts.includes(cert)
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {selectedCerts.includes(cert) && <Check size={14} className="inline mr-1" />}
                {cert}
              </button>
            ))}
          </div>
        </div>

        {/* Added Certifications */}
        {certDetails.length > 0 && (
          <div className="mb-8 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Your Certifications</h3>
            {certDetails.map((cert, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                    <Award size={20} className="text-emerald-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{cert.title}</h4>
                      {cert.issued !== 'Pending verification' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          <ShieldCheck size={10} />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{cert.issued}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCert(idx)}
                  type="button"
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Area */}
        <label className={`block rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          isUploading 
            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' 
            : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}>
          <div className="p-8 text-center">
            {isUploading ? (
              <>
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center animate-pulse">
                  <FileText size={24} className="text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Uploading...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                  <Upload size={24} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Upload Certification Document</h3>
                <p className="text-xs text-slate-500">Drag and drop or click to upload PDF, JPG, or PNG</p>
              </>
            )}
            <input
              type="file"
              onChange={handleCertUpload}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={isUploading}
            />
          </div>
        </label>

        {/* Tip */}
        <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <span className="font-bold">💡 Pro tip:</span> Verified certifications get 3x more profile views. Upload your certification documents to get the verified badge.
          </p>
        </div>
      </div>
    </section>
  );
}
