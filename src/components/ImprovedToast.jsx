import { toast } from "sonner";
import { CheckCircle, AlertCircle, Info, AlertTriangle, Sparkles, Zap } from "lucide-react";

const playSound = (type) => {
  if (typeof window === 'undefined') return;
  
  try {
    const audio = new Audio();
    const sounds = {
      success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKXh8bllHAU2j9bx0H8sBS1+zPLaizsKElyx6OyrWBMJPZnc8sFuJAUqf8vx3I4+CRZkuO7mnEwNDlKm4/G5ZBwFNo/W8dB/LAUufcvx24s8ChJbsOjrrVkSCT2X3PLCbiQFK3/L8dyOPgkWZLju5pxMDQ5SpuPxuWQcBTaP1vHQfywFL33L8duLPAoSW7Do661ZEgk9l9zywm4kBSt/y/HcjzULE2S47uacTA0OUqfj8blkHAU2j9bx0H8sBSx8y/HbjD0KEluw6OytWRIJPZfc8sJuJAUrfsvx3I41CxNkuO7mnEwNDlKn4/G5ZBwFNo/W8dB/LAUsfc',
      error: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
      info: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
    };
    
    audio.src = sounds[type] || sounds.info;
    audio.volume = 0.3;
    audio.play().catch(() => {});
  } catch (e) {}
};

const vibrate = (pattern = [100]) => {
  if (typeof window === 'undefined' || !window.navigator.vibrate) return;
  try {
    window.navigator.vibrate(pattern);
  } catch (e) {}
};

const ImprovedToast = {
  success: (title, description = "", options = {}) => {
    playSound('success');
    vibrate([50, 50, 50]);
    
    return toast.success(title, {
      description,
      icon: <CheckCircle className="w-5 h-5" />,
      duration: 4000,
      className: "bg-gradient-to-r from-green-900/90 to-emerald-900/90 border-green-600",
      ...options
    });
  },

  error: (title, description = "", options = {}) => {
    playSound('error');
    vibrate([100, 50, 100]);
    
    return toast.error(title, {
      description,
      icon: <AlertCircle className="w-5 h-5" />,
      duration: 5000,
      className: "bg-gradient-to-r from-red-900/90 to-rose-900/90 border-red-600",
      ...options
    });
  },

  warning: (title, description = "", options = {}) => {
    playSound('info');
    vibrate([80]);
    
    return toast.warning(title, {
      description,
      icon: <AlertTriangle className="w-5 h-5" />,
      duration: 4500,
      className: "bg-gradient-to-r from-amber-900/90 to-orange-900/90 border-amber-600",
      ...options
    });
  },

  info: (title, description = "", options = {}) => {
    playSound('info');
    
    return toast.info(title, {
      description,
      icon: <Info className="w-5 h-5" />,
      duration: 4000,
      className: "bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border-blue-600",
      ...options
    });
  },

  magic: (title, description = "", options = {}) => {
    playSound('success');
    vibrate([30, 30, 30]);
    
    return toast(title, {
      description,
      icon: <Sparkles className="w-5 h-5 text-yellow-400" />,
      duration: 5000,
      className: "bg-gradient-to-r from-purple-900/90 to-pink-900/90 border-purple-500",
      ...options
    });
  },

  loading: (title, description = "") => {
    return toast.loading(title, {
      description,
      icon: <Zap className="w-5 h-5 animate-pulse" />,
      className: "bg-gradient-to-r from-gray-900/90 to-slate-900/90 border-gray-600"
    });
  },

  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: {
        title: messages.loading || "טוען...",
        icon: <Zap className="w-5 h-5 animate-pulse" />
      },
      success: (data) => {
        playSound('success');
        vibrate([50, 50, 50]);
        return {
          title: messages.success || "הצליח!",
          icon: <CheckCircle className="w-5 h-5" />,
          className: "bg-gradient-to-r from-green-900/90 to-emerald-900/90 border-green-600"
        };
      },
      error: (err) => {
        playSound('error');
        vibrate([100, 50, 100]);
        return {
          title: messages.error || "שגיאה",
          description: err?.message,
          icon: <AlertCircle className="w-5 h-5" />,
          className: "bg-gradient-to-r from-red-900/90 to-rose-900/90 border-red-600"
        };
      }
    });
  }
};

export default ImprovedToast;