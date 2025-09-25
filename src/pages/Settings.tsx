import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { clearSessions } from "../utils/sessionManager";
import { useToast } from "../components/Toast";
import {
  Moon,
  Sun,
  Globe,
  User,
  Lock,
  FileText,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

function Modal({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-3xl w-full p-6 relative max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-red-500"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { showToast, ToastContainer } = useToast();

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const handleClearLocal = () => {
    try {
      clearSessions();
      localStorage.removeItem("lastLessonText");
      localStorage.removeItem("lastLessonLang");
      showToast("✅ Local data cleared", "success");
    } catch {
      showToast("❌ Failed to clear data", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        ⚙️ Settings
      </h1>

      {/* General */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          General
        </h2>

        {/* Dark Mode */}
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

        {/* Language */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <span className="text-gray-800 dark:text-gray-200">Language</span>
          </div>
          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value as "en" | "fr" | "ar")
            }
            className="bg-gray-200 dark:bg-gray-700 rounded px-3 py-1 text-gray-800 dark:text-white"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>

      {/* Legal */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Legal
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            <span className="text-gray-800 dark:text-gray-200">
              Privacy Policy
            </span>
          </div>
          <button
            onClick={() => setShowPrivacy(true)}
            className="text-blue-600 hover:underline"
          >
            View
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span className="text-gray-800 dark:text-gray-200">Disclaimer</span>
          </div>
          <button
            onClick={() => setShowDisclaimer(true)}
            className="text-blue-600 hover:underline"
          >
            View
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            <span className="text-gray-800 dark:text-gray-200">
              Clear Local History
            </span>
          </div>
          <button
            onClick={handleClearLocal}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm text-gray-800 dark:text-gray-200"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Account (placeholder) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Account
        </h2>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            showToast("✅ Saved (demo form)", "success");
          }}
        >
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Email
            </label>
            <div className="flex items-center border rounded px-3 py-2 bg-gray-50 dark:bg-gray-900">
              <User className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-transparent focus:outline-none text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Password
            </label>
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

      {/* Privacy Policy Modal */}
      <Modal
        title="Privacy Policy – SWAY3"
        open={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      >
        <p><strong>Effective date:</strong> 2025‑09‑25</p>
        <p>
          SWAY3 helps students understand lessons via OCR (scanned text) and AI
          explanations. This policy explains what data we collect and how we use it.
        </p>

        <h3>Information We Collect</h3>
        <ul>
          <li>
            <strong>User‑provided content:</strong> lesson text you paste or scan (images),
            questions you ask, and answers you submit in Homework.
          </li>
          <li>
            <strong>Usage & logs:</strong> basic technical logs from our hosting provider
            for reliability and abuse prevention. We don’t build user profiles.
          </li>
        </ul>

        <h3>How We Use Information</h3>
        <ul>
          <li>To generate summaries, hints, chat responses, and exercises using AI.</li>
          <li>To improve reliability, prevent abuse, and troubleshoot issues.</li>
        </ul>

        <h3>AI & Service Providers</h3>
        <p>
          Your content may be sent securely to <strong>Google Generative AI (Gemini)</strong> for
          processing. The app is hosted on <strong>Vercel</strong>. We do not sell personal data.
        </p>

        <h3>Data Storage & Retention</h3>
        <ul>
          <li>
            <strong>On your device:</strong> your study history is stored locally until you clear it
            in Settings.
          </li>
          <li>
            <strong>On our servers:</strong> we don’t persist your lesson content in a database.
            Minimal request logs may be kept by our host for a limited period.
          </li>
        </ul>

        <h3>Security</h3>
        <p>Data is encrypted in transit (HTTPS). We apply reasonable safeguards.</p>

        <h3>Children’s Privacy</h3>
        <p>
          SWAY3 is for general audiences aged 13+. If under 13, use only with parent/guardian or
          school permission. We don’t knowingly collect children’s personal information.
        </p>

        <h3>Your Choices</h3>
        <ul>
          <li>Clear your study history from Settings.</li>
          <li>Contact us for data questions: youremail@example.com</li>
        </ul>

        <p>
          We may update this policy; continued use means you accept changes.
        </p>
      </Modal>

      {/* Disclaimer Modal */}
      <Modal
        title="Disclaimer – SWAY3"
        open={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
      >
        <p>
          SWAY3 provides AI‑generated educational guidance. Information may be incomplete or
          inaccurate.
        </p>
        <ul>
          <li>Verify explanations with your teacher or trusted sources.</li>
          <li>Don’t submit AI‑generated content as your own work.</li>
          <li>Follow your school’s academic honesty policy.</li>
          <li>Not a substitute for professional advice.</li>
          <li>Don’t use the app for harmful or illegal activities.</li>
        </ul>
        <p>By using SWAY3, you agree to these terms.</p>
      </Modal>

      <ToastContainer />
    </div>
  );
}
