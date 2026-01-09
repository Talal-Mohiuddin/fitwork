"use client"

interface AvailabilityGridProps {
  availabilitySlots?: string[]
}

export function AvailabilityGrid({ availabilitySlots = [] }: AvailabilityGridProps) {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
  const times = ["AM", "PM"]

  // Parse availability slots to create grid
  const parseAvailability = () => {
    const availability = {
      AM: [false, false, false, false, false, false, false],
      PM: [false, false, false, false, false, false, false],
    }

    availabilitySlots.forEach(slot => {
      const dayMatch = slot.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i)
      const timeMatch = slot.match(/(AM|PM|am|pm)/)
      
      if (dayMatch && timeMatch) {
        const dayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].findIndex(
          d => d.toLowerCase() === dayMatch[1].toLowerCase()
        )
        const timeKey = timeMatch[1].toUpperCase() as "AM" | "PM"
        
        if (dayIndex !== -1) {
          availability[timeKey][dayIndex] = true
        }
      }
    })

    return availability
  }

  const availability = parseAvailability()

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-x-auto">
      <div className="grid grid-cols-8 gap-4 text-center min-w-max">
        {/* Header */}
        <div />
        {days.map((day) => (
          <div key={day} className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider">
            {day}
          </div>
        ))}

        {/* AM Row */}
        <div className="text-xs font-bold text-slate-600 dark:text-slate-500 self-center text-left">AM</div>
        {availability.AM.map((isAvailable, i) => (
          <div
            key={`am-${i}`}
            className={`h-3 rounded-full ${isAvailable ? "bg-green-500" : "bg-slate-200 dark:bg-slate-800"}`}
            title={isAvailable ? "Available" : "Unavailable"}
          />
        ))}

        {/* PM Row */}
        <div className="text-xs font-bold text-slate-600 dark:text-slate-500 self-center text-left">PM</div>
        {availability.PM.map((isAvailable, i) => (
          <div
            key={`pm-${i}`}
            className={`h-3 rounded-full ${isAvailable ? "bg-green-500" : "bg-slate-200 dark:bg-slate-800"}`}
            title={isAvailable ? "Available" : "Unavailable"}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-end gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">Unavailable</span>
        </div>
      </div>
    </div>
  )
}
