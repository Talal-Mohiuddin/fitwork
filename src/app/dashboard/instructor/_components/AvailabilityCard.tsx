import React from 'react';
import { Calendar } from 'lucide-react';

export default function AvailabilityCard() {
  return (
    <div className="bg-primary p-5 rounded-xl shadow-lg shadow-green-500/20 text-white relative overflow-hidden group">
      {/* Decorative Circle */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-2">
        <Calendar size={32} className="text-white" />
        <h3 className="font-bold text-lg">Open Availability</h3>
        <p className="text-white/80 text-sm mb-2">
          Update your calendar for next week to get more gig matches.
        </p>
        <button className="bg-white text-primary text-sm font-bold py-2 px-4 rounded-lg w-fit hover:bg-green-50 transition-colors">
          Update Now
        </button>
      </div>
    </div>
  );
}
