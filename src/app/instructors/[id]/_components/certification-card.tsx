import { CheckCircle } from "lucide-react"

interface CertificationCardProps {
  title: string
  issued: string
  icon: string
}

export function CertificationCard({ title, issued, icon }: CertificationCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-green-500/30 transition-colors">
      <div className="flex items-center gap-4">
        <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg text-2xl border border-slate-200 dark:border-slate-700">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900 dark:text-white">{title}</span>
          <span className="text-xs text-slate-600 dark:text-slate-500 font-medium">{issued}</span>
        </div>
      </div>
      <CheckCircle className="w-5 h-5 text-green-600" />
    </div>
  )
}
