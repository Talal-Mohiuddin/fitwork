import React from 'react';
import { Send, Search } from 'lucide-react';

interface InstructorBench {
  id: string;
  name: string;
  specialties: string;
  available: boolean;
  image: string;
}

export default function YourBenchSection() {
  const bench: InstructorBench[] = [
    {
      id: '1',
      name: 'Jessica L.',
      specialties: 'Pilates, Yoga',
      available: true,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPz4vNv3VRffmLon5-X61Bf5FJhD3WUrW__qT5mdT3SsVNFHgBGKTscv6XxcHzWEOnvSV7kchew7ILpQBwJE7YbcC0Arqj0Ghu3UbCtv1HWCeFj19iVzAFBgH1qf8HhiKeC3WeicBUbPwgujTEhayY13tCjRML2jlEcWpc8CT9XPxZI-YTSvJn4r8MZQHQ4JILxljDkLig-EqqhXB2h3bMtE8aaIGs5otq42VOKjmIbdjrLZR1BwUwFVi90_Bo5nrXMwPXXiql-W0',
    },
    {
      id: '2',
      name: 'David K.',
      specialties: 'HIIT, Strength',
      available: true,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaMXzCvWJgXqHsE0ON56p-0o4GEbg3LxIcipsi2KlXi9sAUF1uZGkQ4SFzySt45RfueRnfXYEWefUYbrdcbWxbCbmxd8PDzp5E_gy9uJ_I0KBFb6h2w_tkS-wbP7rzbopgN3P6unIGp_6qioeZmpGi4uW9C2vOOaMYY_Yon4QPOe-qzVzkomfeZVucSYZGoQFf67nSW9ZbCugiSKspJA8Xf-TtT0s8SvthsZzv8SFs0WksLnPvC7c7QoTXJjqS272RRh5p0_j7qw4',
    },
    {
      id: '3',
      name: 'Monica G.',
      specialties: 'Barre, Dance',
      available: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUsRTi1CKN6cmTJm482CCdsLtxjSoh7K_vb-Tl-CoNE3plkg1bhGg5GGAhgOOAKW_kdSsKPZQ_ANdyAnrKp4Q2YtLQjFdDyDcImLGn56MwdRmkZHNQTohrCZhfirEq7VEs5rWMtURlkLmXBBbXnfoUjoM1tkONj-rI4RitoRdzvJw4AEaGBUE6lOFj2NoQ_bdi-GrJ2wIAT7y97anrPbmc2_EJ-R7z35sbWH21V7yCb5yTkar799PBUO428huillmAHdMwDXV6F_0',
    },
    {
      id: '4',
      name: 'Alex R.',
      specialties: 'Cycling, HIIT',
      available: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmMZM4Dmg3Eio9a8ihsbgpnwbYEIWi4OoJzF24zgAl1LXoe_1bw81R7x_k2QiJ5lAQaESa-Mcu6dnwfws-fWTU9wfQpCWkcSQvkVKha_3v9qtx-b3KWOwhQ761tyDKksKi7sg8WFricOI2NhJmHANPyQ1vWq_8X0_rA0NoZF6xDEy1pHYsp9KUTPWU84HmhL83lvFvsuF6xugtLGs2aZ0QGoXojYAvZRH1msq-0v2Et6uNRTeaHatqmWkqkuLLmCfy3j_x7ekBk9A',
    },
  ];

  return (
    <section className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm h-full max-h-[600px] flex flex-col">
      <div className="px-6 py-5 border-b border-border-light dark:border-border-dark">
        <h2 className="text-lg font-bold text-text-main dark:text-white">
          Your Bench
        </h2>
        <p className="text-sm text-text-sub">
          Quickly book your favorite instructors.
        </p>
      </div>

      {/* Instructors List */}
      <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
        {bench.map((instructor) => (
          <div
            key={instructor.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="size-10 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${instructor.image})` }}
                />
                <span
                  className={`absolute bottom-0 right-0 size-2.5 border-2 border-white dark:border-gray-800 rounded-full ${
                    instructor.available ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-main dark:text-white">
                  {instructor.name}
                </p>
                <p className="text-xs text-text-sub">{instructor.specialties}</p>
              </div>
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 hover:bg-primary/20 text-primary rounded p-1.5 transition-colors">
              <Send size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border-light dark:border-border-dark">
        <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:bg-primary/5 py-2 rounded-lg transition-colors">
          <Search size={18} />
          Find new talent
        </button>
      </div>
    </section>
  );
}
