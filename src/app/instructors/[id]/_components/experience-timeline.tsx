import { Briefcase } from "lucide-react"
import { Experience } from "@/types"

interface ExperienceTimelineProps {
  experiences?: Experience[]
}

export function ExperienceTimeline({ experiences = [] }: ExperienceTimelineProps) {
  if (experiences.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-green-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Experience</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">No experience added yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-green-500" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Experience</h2>
      </div>
      <div className="space-y-6 relative pl-6 border-l-2 border-slate-200 dark:border-slate-800">
        {experiences.map((exp, index) => (
          <div key={index} className="relative">
            <div
              className={`absolute -left-[20px] top-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 ${
                exp.isActive ? "bg-green-500" : "bg-slate-400 dark:bg-slate-600"
              }`}
            />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">{exp.title}</h4>
              <p
                className={`text-sm font-medium ${exp.isActive ? "text-green-600" : "text-slate-600 dark:text-slate-400"}`}
              >
                {exp.company}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-500 mt-1 font-medium uppercase tracking-wide">
                {exp.period}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
