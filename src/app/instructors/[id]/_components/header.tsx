"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Fitgig</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex gap-6">
            <a
              href="#"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-green-600 transition-colors"
            >
              Find Instructors
            </a>
            <a
              href="#"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-green-600 transition-colors"
            >
              Find Studios
            </a>
            <a
              href="#"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-green-600 transition-colors"
            >
              Post a Job
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus-within:border-green-500 transition-colors w-64">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search instructors..."
              className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-900 dark:text-white placeholder-slate-500"
            />
          </div>

          {/* Auth Buttons */}
          <button className="text-sm font-semibold text-slate-900 dark:text-white hover:text-green-600 transition-colors">
            Log In
          </button>
          <Button className="bg-green-500 hover:bg-green-600 text-white">Sign Up</Button>
        </div>
      </div>
    </header>
  )
}
