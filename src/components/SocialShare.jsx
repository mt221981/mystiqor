import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, Facebook, Twitter, Linkedin, Mail, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EnhancedToast from "@/components/EnhancedToast";

export default function SocialShare({ 
  url = window.location.href, 
  title = "מסע פנימה - חוכמה מיסטית",
  description = "גלה את עצמך באמצעות נומרולוגיה, אסטרולוגיה וטארוט",
  hashtags = ["מסעפנימה", "נומרולוגיה", "אסטרולוגיה"]
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      EnhancedToast.success("הקישור הועתק ללוח! 📋");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      EnhancedToast.error("שגיאה בהעתקת הקישור");
    }
  };

  const handleFacebookShare = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const text = `${title}\n${description}`;
    const hashtagString = hashtags.join(',');
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtagString}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleLinkedInShare = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleWhatsAppShare = () => {
    const text = `${title}\n${description}\n${url}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${description}\n\n${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
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
          className="border-purple-500 text-purple-300 hover:bg-purple-900/30"
        >
          <Share2 className="w-4 h-4 ml-2" />
          שתף
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
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
          <MessageCircle className="w-4 h-4 ml-2 text-green-500" />
          WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleFacebookShare}>
          <Facebook className="w-4 h-4 ml-2 text-blue-500" />
          Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleTwitterShare}>
          <Twitter className="w-4 h-4 ml-2 text-sky-500" />
          Twitter / X
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleLinkedInShare}>
          <Linkedin className="w-4 h-4 ml-2 text-blue-600" />
          LinkedIn
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleEmailShare}>
          <Mail className="w-4 h-4 ml-2 text-gray-400" />
          אימייל
        </DropdownMenuItem>
        
        {navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="w-4 h-4 ml-2" />
            שיתוף מערכת
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Floating share button for mobile
export function FloatingShareButton({ url, title, description }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-24 left-6 z-40 md:hidden"
    >
      <SocialShare url={url} title={title} description={description} />
    </motion.div>
  );
}