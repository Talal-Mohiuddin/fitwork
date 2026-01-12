"use client";

import { JobPostingData } from "@/types";
import { Calendar, Clock, MapPin, RotateCw } from "lucide-react";
import { useState } from "react";

interface StepScheduleLocationProps {
  formData: JobPostingData;
  updateFormData: (updates: Partial<JobPostingData>) => void;
}

const timeSlots = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
];

export default function StepScheduleLocation({ formData, updateFormData }: StepScheduleLocationProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    formData.date ? new Date(formData.date) : null
  );

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    updateFormData({ date: date.toISOString().split("T")[0] });
  };

  // Generate calendar days
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays: (number | null)[] = [];
  
  // Add empty slots for days before the first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white mb-3">
        When & Where is the session?
      </h2>
      <p className="text-text-sub dark:text-gray-400 mb-8">
        Set the schedule and confirm the studio location for this gig.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-main dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-text-sub" />
              Select Date
            </h3>
          </div>

          {/* Month Header */}
          <div className="flex items-center justify-between mb-4">
            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <span className="text-text-sub">{"<"}</span>
            </button>
            <span className="font-medium text-text-main dark:text-white">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <span className="text-text-sub">{">"}</span>
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-text-sub py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) {
                return <div key={i} className="h-10" />;
              }

              const date = new Date(currentYear, currentMonth, day);
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isPast = date < new Date(today.toDateString());
              const isToday = date.toDateString() === today.toDateString();

              return (
                <button
                  key={i}
                  disabled={isPast}
                  onClick={() => handleDateSelect(date)}
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm transition-colors ${
                    isSelected
                      ? "bg-primary text-white font-semibold"
                      : isPast
                      ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                      : isToday
                      ? "bg-primary/20 text-primary font-medium"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700 text-text-main dark:text-white"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Recurring Toggle */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => updateFormData({ isRecurring: !formData.isRecurring })}
              className={`w-12 h-6 rounded-full transition-colors ${
                formData.isRecurring ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                formData.isRecurring ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
            <span className="text-sm text-text-main dark:text-white flex items-center gap-2">
              <RotateCw className="w-4 h-4" />
              This is a recurring class
            </span>
          </div>
        </div>

        {/* Time & Location */}
        <div className="space-y-6">
          {/* Time Selection */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
            <h3 className="font-semibold text-text-main dark:text-white flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-text-sub" />
              Time
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-sub mb-2">START TIME</label>
                <select
                  value={formData.startTime}
                  onChange={(e) => updateFormData({ startTime: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-text-main dark:text-white"
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-sub mb-2">END TIME</label>
                <select
                  value={formData.endTime}
                  onChange={(e) => updateFormData({ endTime: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-text-main dark:text-white"
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
            <h3 className="font-semibold text-text-main dark:text-white flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-text-sub" />
              Location
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-sub mb-2">STUDIO ADDRESS</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateFormData({ location: e.target.value })}
                    placeholder="Search for address..."
                    className="w-full px-4 py-3 pl-10 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-text-main dark:text-white"
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" />
                </div>
              </div>

              <button 
                type="button"
                className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
              >
                ✦ Use default studio address
              </button>

              {/* Map Placeholder */}
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-text-sub text-sm">Map Preview</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}
