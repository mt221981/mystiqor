import { toast } from "sonner";
import { CheckCircle, AlertCircle, Info, AlertTriangle, Sparkles } from "lucide-react";

const EnhancedToast = {
  success: (title, description = "", options = {}) => {
    return toast.success(title, {
      description,
      icon: <CheckCircle className="w-5 h-5" />,
      duration: 4000,
      ...options
    });
  },

  error: (title, description = "", options = {}) => {
    return toast.error(title, {
      description,
      icon: <AlertCircle className="w-5 h-5" />,
      duration: 5000,
      ...options
    });
  },

  warning: (title, description = "", options = {}) => {
    return toast.warning(title, {
      description,
      icon: <AlertTriangle className="w-5 h-5" />,
      duration: 4500,
      ...options
    });
  },

  info: (title, description = "", options = {}) => {
    return toast.info(title, {
      description,
      icon: <Info className="w-5 h-5" />,
      duration: 4000,
      ...options
    });
  },

  custom: (title, description = "", options = {}) => {
    return toast(title, {
      description,
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      duration: 4000,
      ...options
    });
  },

  loading: (title, description = "") => {
    return toast.loading(title, {
      description
    });
  },

  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || "טוען...",
      success: messages.success || "הצליח!",
      error: messages.error || "שגיאה"
    });
  }
};

export default EnhancedToast;