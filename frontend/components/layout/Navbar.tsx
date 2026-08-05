"use client";

import { LogOut, Moon, Sun } from "lucide-react";

import { APP_NAME } from "@/constants/app.constants";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { WorkspaceSwitcher } from "@/components/layout/WorkspaceSwitcher";
import { ProjectSwitcher } from "@/components/layout/ProjectSwitcher";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary text-white text-small font-bold flex items-center justify-center">
            P
          </div>
          <span className="font-semibold text-small">{APP_NAME}</span>
        </div>
        <div className="h-5 w-px bg-gray-200 dark:bg-gray-800" />
        <WorkspaceSwitcher />
        <ProjectSwitcher />
      </div>

      <div className="flex items-center gap-3">
        <button
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-800">
            <span className="text-small font-medium">{user.name}</span>
            <button
              aria-label="Log out"
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
