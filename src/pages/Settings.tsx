import { useTheme } from "../contexts/ThemeContext";

export function Settings() {
  const { theme, toggleTheme } = useTheme();

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
            <select className="bg-gray-200 dark:bg-gray-600 rounded px-2 py-1" disabled>
              <option>English</option>
              <option>French</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Subjects</h2>
          <div className="flex gap-2 flex-wrap">
            {["Math", "Physics", "Chemistry", "History"].map((subject) => (
              <span
                key={subject}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-600 text-blue-800 dark:text-white rounded-full text-sm"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Account</h2>
          <form className="space-y-2">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-2 py-1 border rounded dark:bg-gray-700"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-2 py-1 border rounded dark:bg-gray-700"
            />
            <button type="submit" className="w-full px-3 py-2 bg-blue-500 text-white rounded">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}