import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, CheckCircle, Facebook, Twitter, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedToast from "./EnhancedToast";

export default function GraphologyShareButton({ analysisId, title }) {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}${window.location.pathname}?analysis=${analysisId}`;
  const shareText = `בדקתי את כתב היד שלי עם גרפו-לוגוס! ${title || 'תוצאות מרתקות'}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    EnhancedToast.success('הקישור הועתק!', '📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareViaTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareViaEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent('תוצאות ניתוח גרפולוגי')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
  };

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ניתוח גרפולוגי - גרפו-לוגוס',
          text: shareText,
          url: shareUrl
        });
        EnhancedToast.success('שותף בהצלחה!', '✨');
      } catch (error) {
        if (error.name !== 'AbortError') {
          EnhancedToast.error('שגיאה בשיתוף', '');
        }
      }
    } else {
      setShowOptions(true);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={shareViaWebAPI}
        variant="outline"
        className="border-purple-600 text-purple-300 hover:bg-purple-800/30"
      >
        <Share2 className="w-5 h-5 ml-2" />
        שתף תוצאות
      </Button>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 bg-gray-900 border-2 border-purple-700 rounded-xl p-4 shadow-2xl z-50 w-64"
          >
            <h4 className="text-white font-bold mb-3">שתף דרך:</h4>
            <div className="space-y-2">
              <Button
                onClick={copyToClipboard}
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800"
              >
                {copied ? <CheckCircle className="w-4 h-4 ml-2 text-green-400" /> : <Copy className="w-4 h-4 ml-2" />}
                {copied ? 'הועתק!' : 'העתק קישור'}
              </Button>
              <Button
                onClick={shareViaFacebook}
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800"
              >
                <Facebook className="w-4 h-4 ml-2 text-blue-500" />
                Facebook
              </Button>
              <Button
                onClick={shareViaTwitter}
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800"
              >
                <Twitter className="w-4 h-4 ml-2 text-sky-400" />
                Twitter
              </Button>
              <Button
                onClick={shareViaEmail}
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800"
              >
                <Mail className="w-4 h-4 ml-2 text-red-400" />
                Email
              </Button>
            </div>
            <Button
              onClick={() => setShowOptions(false)}
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-gray-400 hover:text-white"
            >
              סגור
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}