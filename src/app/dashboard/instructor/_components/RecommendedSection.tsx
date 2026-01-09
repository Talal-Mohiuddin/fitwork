import React from 'react';

interface RecommendedGig {
  id: string;
  title: string;
  studio: string;
  location: string;
  rate: string;
  tags: string[];
  logo: string;
}

export default function RecommendedSection() {
  const gigs: RecommendedGig[] = [
    {
      id: '1',
      title: 'Cycling Instructor Sub',
      studio: 'SoulCycle',
      location: 'SoHo Studio',
      rate: '$65 / class',
      tags: ['Morning', 'Spin'],
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRXRlbHd4hWuKj2Cw_n79f-CWaQE5W0G5fvTLgEKnk8Hc4w_Ku_2qHolJrt7QqY8f4tUJyF-horIezBW-uvAEuzMOEfrQB5bmtbY9CkJ3T4VVRj-xIY-Gmsw5KKm657TTurWhJaO_nrrVnfk7OnIre-OZBXafK8RjsD9zbiDUW_8AfZrhToBPYWgGSXpu93Z9Nl45Gj_InEGnm640CGb9NaBgl3ExvM9FiY9AjSmkLTxKy1yXVxXBHCjUUqoRuwZcZ9KnijXTHXvA',
    },
    {
      id: '2',
      title: 'Boxing Coach',
      studio: 'Rumble',
      location: 'Chelsea',
      rate: '$75 / class',
      tags: ['Evening', 'Boxing'],
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfrytXrr8RX2q-O4xVPZjXXRzzJ8CmuBK7EU-iIJM__Qk_L5ZLZhFf32pLuG8idg3xcej0_Mkm865Bh_7gyPiy00nGtD_Ib_QTYPfamfBUAExZY2INlGBYbFxrREyVs6NRWRxzqPFQMcbpIxOa-FCC83Vxj9fB8hk59vYwYMxPcmo7UI5okuIjKdiJNvUPK3WVmwJwS7M9tPAojvCyR_ElU4a3neq49oj0KW8bsn0PEllgtmtNgiG4u6jQ0FeCJacEQrndB8yYgeM',
    },
  ];

  return (
    <section>
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
          Recommended for You
        </h2>
        <a className="text-primary text-sm font-medium hover:text-green-700 transition-colors" href="#">
          See All
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gigs.map((gig) => (
          <div
            key={gig.id}
            className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className="size-10 rounded-full bg-cover bg-center border border-slate-100 dark:border-slate-700"
                style={{ backgroundImage: `url(${gig.logo})` }}
              />
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded-md">
                {gig.rate}
              </span>
            </div>

            <h3 className="text-slate-900 dark:text-white font-bold text-base mb-1">
              {gig.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              {gig.studio} • {gig.location}
            </p>

            <div className="flex gap-2 mb-4">
              {gig.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            <button className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm rounded-lg transition-colors">
              Quick Apply
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
