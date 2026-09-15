import React from 'react';
import { Sprout, Sun, Moon, BookOpen, RefreshCw, LogOut, UserCheck, ShieldCheck } from 'lucide-react';

export default function Header({
  systemHealth,
  farmerUser,
  onLogout,
  onClearChat,
  onOpenDocsModal,
  theme,
  onToggleTheme,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 shadow-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-green-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-bold text-stone-900 dark:text-white text-xl leading-tight tracking-tight">
                Agriva
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                அக்ரிவா
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium hidden sm:block">
              Intelligent Multilingual Agricultural Advisory
            </p>
          </div>
        </div>

        {/* Center / Right Status Badges & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Active Farmer Profile Badge */}
          {farmerUser && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="max-w-[110px] sm:max-w-[150px] truncate font-semibold">
                {farmerUser.name}
              </span>
              <button
                onClick={onLogout}
                className="ml-1 p-1 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors"
                title="Change User / Logout"
                aria-label="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Knowledge Base Records */}
          <button
            onClick={onOpenDocsModal}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium border border-stone-200/80 dark:border-stone-700 transition-colors"
            title="View 16 Certified Knowledge Base Documents"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Knowledge:</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {systemHealth?.total_documents ? `${systemHealth.total_documents} Docs` : '16 Docs'}
            </span>
          </button>

          {/* Theme Toggle (Sun/Moon) */}
          <button
            onClick={onToggleTheme}
            type="button"
            className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm transition-all"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-700" />
            )}
          </button>

          {/* Reset / New Chat */}
          <button
            onClick={onClearChat}
            className="p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
            title="Reset Conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
