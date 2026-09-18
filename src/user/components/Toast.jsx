import React, { useEffect, useRef } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../utils.jsx";

const Toast = ({ message, type = "success", duration = 3500, onClose }) => {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const timer = setTimeout(() => onCloseRef.current(), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);
  return (
    <div className={cn(
      "fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-bold z-[200] border backdrop-blur-md whitespace-nowrap",
      type === "success" ? "bg-slate-900/95 text-white border-slate-700" : "bg-red-900/95 text-white border-red-700"
    )}>
      {type === "success" ? <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
      {message}
    </div>
  );
};

export default Toast;
