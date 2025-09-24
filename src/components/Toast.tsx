import { useState, useEffect } from "react";

export function Toast({ message, type, onClose }: { message: string; type?: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-24 right-4 px-4 py-2 rounded shadow-lg text-white 
      ${type === "error" ? "bg-red-600" : "bg-green-600"}`}
    >
      {message}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<
    { id: number; message: string; type?: "success" | "error" }[]
  >([]);

  const showToast = (message: string, type?: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const ToastContainer = () => (
    <>
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
      ))}
    </>
  );

  return { showToast, ToastContainer };
}
