import type { ReactNode } from "react"

interface StatCardProps {
  label: string
  value: string
  icon?: ReactNode
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold text-slate-900 dark:text-white">{value}</span>
        {icon && <div className="ml-auto">{icon}</div>}
      </div>
      <span className="text-xs text-slate-600 dark:text-slate-500 font-medium uppercase tracking-wider mt-2 inline-block">
        {label}
      </span>
    </div>
  )
}
