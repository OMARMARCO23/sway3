import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="font-semibold mb-2">General</h2>

          <div className="flex items-center justify-between mb-2">
            <span>Dark Mode</span>
            <button
              onClick={toggleTheme}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span>Language</span>
            <select
              className="bg-gray-200 dark:bg-gray-600 rounded px-2 py-1"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
