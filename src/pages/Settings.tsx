import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Moon, Sun, Globe, User, Lock } from "lucide-react";

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">⚙️ Settings</h1>

      {/* General Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">General</h2>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {theme === "dark" ? (
              <Moon className="w-5 h-5 text-purple-500" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500" />
            )}
            <span className="text-gray-800 dark:text-gray-200">Dark Mode</span>
          </div>
          <button
            onClick={toggleTheme}
            className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded text-sm text-gray-800 dark:text-gray-200"
          >
            {theme === "dark" ? "Disable" : "Enable"}
          </button>
        </div>

        {/* Language Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <span className="text-gray-800 dark:text-gray-200">Language</span>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "fr" | "ar")}
            className="bg-gray-200 dark:bg-gray-700 rounded px-3 py-1 text-gray-800 dark:text-white"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>

      {/* Account Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Account</h2>

        <form className="space-y-4">
          {/* Email input */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email</label>
            <div className="flex items-center border rounded px-3 py-2 bg-gray-50 dark:bg-gray-900">
              <User className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-transparent focus:outline-none text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Password</label>
            <div className="flex items-center border rounded px-3 py-2 bg-gray-50 dark:bg-gray-900">
              <Lock className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="password"
                placeholder="Enter your password"
                className="flex-1 bg-transparent focus:outline-none text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
