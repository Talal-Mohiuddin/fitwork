import React from 'react';
import { Star, Calendar } from 'lucide-react';

interface Application {
  id: string;
  name: string;
  rating: number;
  experience: string;
  appliedTime: string;
  position: string;
  image: string;
}

export default function PendingApplicationsSection() {
  const applications: Application[] = [
    {
      id: '1',
      name: 'Sarah Jenkins',
      rating: 4.9,
      experience: '200+ classes',
      appliedTime: '2h ago',
      position: 'Vinyasa Yoga • Fri, 6:00 PM',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOkG3TQspex9780LjlRN5Q4CL_9_eO-tI2Bsfo_4dF5i5xSZMTpIBWpLwv4ZSo5D-JyCq69dCTU8U088QNQdYzK-5bZu_bgAFh6vj92ID99XsXflKZj8ct0L3UufhpS4_k3qeeJtEVu1BfYPNB_h9s8MAtGTrqrGdcvuN0Orgb3-2hwIDXnDCPAXQnRg4IIfzw3gnkbot6l6dKN3A8QaY52KY3KAnypuQLRTLsO0DcXGShh_RaKgmYMHmuerAffPLZeL5Jy9uGynY',
    },
    {
      id: '2',
      name: 'Mark Thompson',
      rating: 4.8,
      experience: 'New Talent',
      appliedTime: '5h ago',
      position: 'HIIT Flow • Tomorrow, 7 AM',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrdiT0bPbLnQShP1fVPhcQYnorIX7pLQ17Xc8TzUIOoNTMva2l12D-mpUEUHUeeJ1b3ppmckcuIIPzHidOEvEjGbtT8oy1Zo_IQfygVv1YqFowwLrPiQ5QkNvz1QCRbBjs668MkmMcUog_UJNmFF_0n2opmXM-XiAQqUDiFnnRDYwnDcbysy2Pl7dvLXwNWWeu0Exe2WhKH_q6ROolItVvjsjS19FE4fMtwVuFoSGcJh8pXyuMg-R4f2DkuaqoBtNWJB_f1HHctaE',
    },
  ];

  return (
    <section>
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-lg font-bold text-text-main dark:text-white">
          Pending Applications
        </h2>
        <span className="text-xs font-medium text-text-sub bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          5 New
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div
                  className="size-12 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${app.image})` }}
                />
                <div>
                  <h3 className="text-sm font-bold text-text-main dark:text-white">
                    {app.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-text-sub mt-0.5">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-text-main dark:text-gray-300">
                      {app.rating}
                    </span>
                    <span>• {app.experience}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                Applied {app.appliedTime}
              </span>
            </div>

            {/* Position */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <p className="text-xs text-text-sub mb-1">Applying for:</p>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-text-main dark:text-white" />
                <span className="text-sm font-medium text-text-main dark:text-white">
                  {app.position}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <button className="flex items-center justify-center h-9 px-3 rounded-lg border border-border-light dark:border-gray-600 text-sm font-medium text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                View Profile
              </button>
              <button className="flex items-center justify-center h-9 px-3 rounded-lg bg-primary hover:bg-primary-dark text-sm font-medium text-white shadow-sm transition-colors">
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
