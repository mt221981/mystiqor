import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ShareResults({ analysis, title = "הניתוח שלי" }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${title} - ${analysis.summary || 'ניתוח מיסטי'}\n\nמסע פנימה 🌟`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('הקישור הועתק ללוח! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('שגיאה בהעתקת הקישור');
      console.error('Copy error:', error);
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        });
        toast.success('שותף בהצלחה! 🎉');
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('שגיאה בשיתוף');
          console.error('Share error:', error);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-blue-500 text-blue-300 hover:bg-blue-800/30"
        >
          <Share2 className="w-4 h-4 ml-2" />
          שתף
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check className="w-4 h-4 ml-2 text-green-500" />
              הועתק!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 ml-2" />
              העתק קישור
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsAppShare}>
          <span className="ml-2">💬</span>
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEmailShare}>
          <span className="ml-2">📧</span>
          אימייל
        </DropdownMenuItem>
        {typeof navigator !== 'undefined' && navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="w-4 h-4 ml-2" />
            שיתוף מערכת
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}