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

type Lang = "en" | "fr" | "ar";

const i18n = {
  en: {
    pageTitle: "⚙️ Settings",
    general: "General",
    darkMode: "Dark Mode",
    darkEnable: "Enable",
    darkDisable: "Disable",
    language: "Language",
    legal: "Legal",
    privacyPolicy: "Privacy Policy",
    disclaimer: "Disclaimer",
    view: "View",
    clearLocal: "Clear Local History",
    clearBtn: "Clear",
    clearOk: "✅ Local data cleared",
    clearFail: "❌ Failed to clear data",
    account: "Account",
    email: "Email",
    password: "Password",
    save: "Save",
    saveOk: "✅ Saved (demo form)",
    // Privacy modal
    privacyTitle: "Privacy Policy – SWAY3",
    effective: "Effective date",
    privacyIntro:
      "SWAY3 helps students understand lessons via OCR (scanned text) and AI explanations. This policy explains what data we collect and how we use it.",
    collectTitle: "Information We Collect",
    collectItems: [
      "User‑provided content: lesson text you paste or scan (images), questions you ask, and answers you submit in Homework.",
      "Usage & logs: basic technical logs from our hosting provider for reliability and abuse prevention. We don’t build user profiles.",
    ],
    useTitle: "How We Use Information",
    useItems: [
      "To generate summaries, hints, chat responses, and exercises using AI.",
      "To improve reliability, prevent abuse, and troubleshoot issues.",
    ],
    aiTitle: "AI & Service Providers",
    aiBody:
      "Your content may be sent securely to Google Generative AI (Gemini) for processing. The app is hosted on Vercel. We do not sell personal data.",
    storageTitle: "Data Storage & Retention",
    storageItems: [
      "On your device: your study history is stored locally until you clear it in Settings.",
      "On our servers: we don’t persist your lesson content in a database. Minimal request logs may be kept by our host for a limited period.",
    ],
    securityTitle: "Security",
    securityBody: "Data is encrypted in transit (HTTPS). We apply reasonable safeguards.",
    childrenTitle: "Children’s Privacy",
    childrenBody:
      "SWAY3 is for general audiences aged 13+. If under 13, use only with parent/guardian or school permission. We don’t knowingly collect children’s personal information.",
    choicesTitle: "Your Choices",
    choicesItems: [
      "Clear your study history from Settings.",
      "Contact us for data questions: youremail@example.com",
    ],
    changes:
      "We may update this policy; continued use means you accept changes.",
    // Disclaimer modal
    disclaimerTitle: "Disclaimer – SWAY3",
    disclaimerBody:
      "SWAY3 provides AI‑generated educational guidance. Information may be incomplete or inaccurate.",
    disclaimerItems: [
      "Verify explanations with your teacher or trusted sources.",
      "Don’t submit AI‑generated content as your own work.",
      "Follow your school’s academic honesty policy.",
      "Not a substitute for professional advice.",
      "Do not use the app for harmful or illegal activities.",
    ],
  },
  fr: {
    pageTitle: "⚙️ Paramètres",
    general: "Général",
    darkMode: "Mode sombre",
    darkEnable: "Activer",
    darkDisable: "Désactiver",
    language: "Langue",
    legal: "Mentions légales",
    privacyPolicy: "Politique de confidentialité",
    disclaimer: "Avertissement",
    view: "Voir",
    clearLocal: "Effacer l’historique local",
    clearBtn: "Effacer",
    clearOk: "✅ Données locales effacées",
    clearFail: "❌ Échec de la suppression",
    account: "Compte",
    email: "E‑mail",
    password: "Mot de passe",
    save: "Enregistrer",
    saveOk: "✅ Enregistré (formulaire démo)",
    // Privacy modal
    privacyTitle: "Politique de confidentialité – SWAY3",
    effective: "Date d’entrée en vigueur",
    privacyIntro:
      "SWAY3 aide les élèves à comprendre leurs leçons grâce à l’OCR (texte scanné) et à des explications IA. Cette politique explique quelles données nous collectons et comment nous les utilisons.",
    collectTitle: "Données collectées",
    collectItems: [
      "Contenu fourni par l’utilisateur : texte de leçon collé ou scanné (images), questions posées et réponses saisies dans Devoirs.",
      "Utilisation & journaux : journaux techniques de base de notre hébergeur pour la fiabilité et la prévention des abus. Nous ne créons pas de profils d’utilisateur.",
    ],
    useTitle: "Utilisation des données",
    useItems: [
      "Générer des résumés, des indices, des réponses de chat et des exercices à l’aide de l’IA.",
      "Améliorer la fiabilité, prévenir les abus et résoudre les problèmes.",
    ],
    aiTitle: "IA & Prestataires",
    aiBody:
      "Votre contenu peut être envoyé de manière sécurisée à Google Generative AI (Gemini) pour traitement. L’application est hébergée sur Vercel. Nous ne vendons pas de données personnelles.",
    storageTitle: "Stockage & Conservation",
    storageItems: [
      "Sur votre appareil : votre historique d’étude est stocké localement jusqu’à suppression dans Paramètres.",
      "Sur nos serveurs : nous ne conservons pas votre contenu de leçon en base de données. Des journaux minimaux peuvent être conservés par l’hébergeur pendant une durée limitée.",
    ],
    securityTitle: "Sécurité",
    securityBody:
      "Les données sont chiffrées en transit (HTTPS). Nous appliquons des mesures raisonnables.",
    childrenTitle: "Confidentialité des enfants",
    childrenBody:
      "SWAY3 s’adresse à un public de 13 ans et plus. Si vous avez moins de 13 ans, utilisez l’app avec l’autorisation d’un parent/tuteur ou de l’école. Nous ne collectons pas sciemment de données personnelles d’enfants.",
    choicesTitle: "Vos choix",
    choicesItems: [
      "Effacer votre historique d’étude dans Paramètres.",
      "Nous contacter pour toute question liée aux données : youremail@example.com",
    ],
    changes:
      "Nous pouvons mettre à jour cette politique ; l’utilisation continue vaut acceptation.",
    // Disclaimer modal
    disclaimerTitle: "Avertissement – SWAY3",
    disclaimerBody:
      "SWAY3 fournit des conseils éducatifs générés par IA. Les informations peuvent être incomplètes ou inexactes.",
    disclaimerItems: [
      "Vérifiez les explications auprès d’un professeur ou de sources fiables.",
      "N’utilisez pas le contenu généré par IA comme votre propre travail.",
      "Respectez les règles d’honnêteté académique de votre établissement.",
      "Ce n’est pas un substitut à un avis professionnel.",
      "N’utilisez pas l’app à des fins illégales ou nuisibles.",
    ],
  },
  ar: {
    pageTitle: "⚙️ الإعدادات",
    general: "عام",
    darkMode: "الوضع الداكن",
    darkEnable: "تفعيل",
    darkDisable: "تعطيل",
    language: "اللغة",
    legal: "الشؤون القانونية",
    privacyPolicy: "سياسة الخصوصية",
    disclaimer: "إخلاء المسؤولية",
    view: "عرض",
    clearLocal: "مسح السجل المحلي",
    clearBtn: "مسح",
    clearOk: "✅ تم مسح البيانات المحلية",
    clearFail: "❌ فشل مسح البيانات",
    account: "الحساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    save: "حفظ",
    saveOk: "✅ تم الحفظ (نموذج تجريبي)",
    // Privacy modal
    privacyTitle: "سياسة الخصوصية – SWAY3",
    effective: "تاريخ السريان",
    privacyIntro:
      "يساعد SWAY3 الطلاب على فهم الدروس عبر التعرف الضوئي على الحروف (OCR) وتفسيرات بالذكاء الاصطناعي. توضح هذه السياسة البيانات التي نجمعها وكيف نستخدمها.",
    collectTitle: "البيانات التي نجمعها",
    collectItems: [
      "المحتوى الذي يقدمه المستخدم: نصوص الدروس التي تلصقها أو تمسحها (صور)، الأسئلة التي تطرحها، والإجابات التي تُدخلها في الواجبات.",
      "الاستخدام والسجلات: سجلات تقنية أساسية من مزود الاستضافة للموثوقية ومنع إساءة الاستخدام. لا ننشئ ملفات شخصية للمستخدمين.",
    ],
    useTitle: "كيفية استخدام البيانات",
    useItems: [
      "لإنشاء ملخصات وإشارات (Hints) وردود محادثة وتمارين بواسطة الذكاء الاصطناعي.",
      "لتحسين الموثوقية، منع الإساءة، وحل المشكلات.",
    ],
    aiTitle: "الذكاء الاصطناعي ومقدمو الخدمة",
    aiBody:
      "قد يُرسل محتواك بشكل آمن إلى Google Generative AI (Gemini) للمعالجة. والتطبيق مستضاف على Vercel. لا نبيع البيانات الشخصية.",
    storageTitle: "التخزين والاحتفاظ",
    storageItems: [
      "على جهازك: يتم تخزين سجلك الدراسي محلياً حتى تقوم بمسحه من الإعدادات.",
      "على خوادمنا: لا نحتفظ بمحتوى الدروس في قاعدة بيانات. قد يحتفظ المضيف بسجلات محدودة لفترة زمنية قصيرة.",
    ],
    securityTitle: "الأمان",
    securityBody:
      "يتم تشفير البيانات أثناء النقل (HTTPS). نعتمد تدابير معقولة للأمان.",
    childrenTitle: "خصوصية الأطفال",
    childrenBody:
      "يُوجَّه SWAY3 للجمهور العام بعمر 13+ سنة. إذا كنت أصغر من ذلك فاستخدم التطبيق بإذن ولي الأمر أو المدرسة. لا نجمع عمداً بيانات شخصية عن الأطفال.",
    choicesTitle: "خياراتك",
    choicesItems: [
      "امسح سجلك الدراسي من الإعدادات.",
      "راسلنا لأسئلة البيانات: youremail@example.com",
    ],
    changes:
      "قد نُحدّث هذه السياسة؛ ويُعدّ الاستمرار في الاستخدام قبولاً للتحديث.",
    // Disclaimer modal
    disclaimerTitle: "إخلاء المسؤولية – SWAY3",
    disclaimerBody:
      "يوفر SWAY3 إرشادات تعليمية ناتجة عن الذكاء الاصطناعي. قد تكون المعلومات غير كاملة أو غير دقيقة.",
    disclaimerItems: [
      "تحقّق من الشروحات مع معلمك أو مصادر موثوقة.",
      "لا تقدّم المحتوى المُنشأ بالذكاء الاصطناعي على أنه عملك الخاص.",
      "التزم بسياسة النزاهة الأكاديمية في مدرستك.",
      "ليس بديلاً عن الاستشارات المهنية.",
      "لا تستخدم التطبيق لأغراض ضارة أو غير قانونية.",
    ],
  },
} as const;

function Modal({
  title,
  open,
  onClose,
  children,
  dir = "ltr",
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  dir?: "ltr" | "rtl";
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
      dir={dir}
    >
      <div
        className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-3xl w-full p-6 relative max-h-[80vh] overflow-y-auto ${
          dir === "rtl" ? "text-right" : ""
        }`}
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

  const t = i18n[language as Lang];
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const handleClearLocal = () => {
    try {
      clearSessions();
      localStorage.removeItem("lastLessonText");
      localStorage.removeItem("lastLessonLang");
      showToast(
        language === "fr" ? i18n.fr.clearOk : language === "ar" ? i18n.ar.clearOk : i18n.en.clearOk,
        "success"
      );
    } catch {
      showToast(
        language === "fr" ? i18n.fr.clearFail : language === "ar" ? i18n.ar.clearFail : i18n.en.clearFail,
        "error"
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {t.pageTitle}
      </h1>

      {/* General */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t.general}
        </h2>

        {/* Dark Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {theme === "dark" ? (
              <Moon className="w-5 h-5 text-purple-500" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500" />
            )}
            <span className="text-gray-800 dark:text-gray-200">{t.darkMode}</span>
          </div>
          <button
            onClick={toggleTheme}
            className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded text-sm text-gray-800 dark:text-gray-200"
          >
            {theme === "dark" ? t.darkDisable : t.darkEnable}
          </button>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <span className="text-gray-800 dark:text-gray-200">{t.language}</span>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Lang)}
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
          {t.legal}
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            <span className="text-gray-800 dark:text-gray-200">{t.privacyPolicy}</span>
          </div>
          <button onClick={() => setShowPrivacy(true)} className="text-blue-600 hover:underline">
            {t.view}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span className="text-gray-800 dark:text-gray-200">{t.disclaimer}</span>
          </div>
          <button onClick={() => setShowDisclaimer(true)} className="text-blue-600 hover:underline">
            {t.view}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            <span className="text-gray-800 dark:text-gray-200">{t.clearLocal}</span>
          </div>
          <button
            onClick={handleClearLocal}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm text-gray-800 dark:text-gray-200"
          >
            {t.clearBtn}
          </button>
        </div>
      </div>

      {/* Account (placeholder) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t.account}</h2>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            showToast(
              language === "fr" ? i18n.fr.saveOk : language === "ar" ? i18n.ar.saveOk : i18n.en.saveOk,
              "success"
            );
          }}
        >
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              {t.email}
            </label>
            <div className="flex items-center border rounded px-3 py-2 bg-gray-50 dark:bg-gray-900">
              <User className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="email"
                placeholder={t.email}
                className="flex-1 bg-transparent focus:outline-none text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              {t.password}
            </label>
            <div className="flex items-center border rounded px-3 py-2 bg-gray-50 dark:bg-gray-900">
              <Lock className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="password"
                placeholder={t.password}
                className="flex-1 bg-transparent focus:outline-none text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
          >
            {t.save}
          </button>
        </form>
      </div>

      {/* Privacy Policy Modal */}
      <Modal
        title={t.privacyTitle}
        open={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <p>
          <strong>{t.effective}:</strong> 2025‑09‑25
        </p>
        <p>{t.privacyIntro}</p>

        <h3>{t.collectTitle}</h3>
        <ul>
          {t.collectItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h3>{t.useTitle}</h3>
        <ul>
          {t.useItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h3>{t.aiTitle}</h3>
        <p>{t.aiBody}</p>

        <h3>{t.storageTitle}</h3>
        <ul>
          {t.storageItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h3>{t.securityTitle}</h3>
        <p>{t.securityBody}</p>

        <h3>{t.childrenTitle}</h3>
        <p>{t.childrenBody}</p>

        <h3>{t.choicesTitle}</h3>
        <ul>
          {t.choicesItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <p>{t.changes}</p>
      </Modal>

      {/* Disclaimer Modal */}
      <Modal
        title={t.disclaimerTitle}
        open={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <p>{t.disclaimerBody}</p>
        <ul>
          {t.disclaimerItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </Modal>

      <ToastContainer />
    </div>
  );
}
