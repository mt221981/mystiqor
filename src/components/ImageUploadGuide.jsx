import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedToast from "./EnhancedToast";
import ImageQualityIndicator from "./ImageQualityIndicator";

const GUIDE_CONTENT = {
  palm: {
    title: "איך לצלם את כף היד?",
    tips: [
      "✋ כף היד פתוחה לחלוטין, אצבעות מרווחות",
      "💡 תאורה טבעית או מנורה בהירה (לא פלאש)",
      "📐 מלמעלה ישר, לא מהצד",
      "🖐️ רק כף היד - ללא רקע מבלבל",
      "📸 הקווים צריכים להיות ברורים וחדים"
    ],
    accept: "image/*",
    exampleImage: "https://via.placeholder.com/400x300?text=Palm+Example"
  },
  handwriting: {
    title: "איך לצלם את כתב היד?",
    tips: [
      "✍️ כתוב טקסט חופשי (10+ שורות) בעט כחול/שחור",
      "📄 נייר לבן ורגיל (לא משובץ)",
      "💡 תאורה אחידה ללא צללים",
      "📐 מלמעלה ישר - כל הדף בתמונה",
      "🔍 הכתב חייב להיות קריא וברור",
      "📏 שולי הדף צריכים להיראות"
    ],
    accept: "image/*",
    exampleImage: "https://via.placeholder.com/400x300?text=Handwriting+Example"
  },
  drawing: {
    title: "איך לצלם את הציור?",
    tips: [
      "🎨 ציור חופשי על נייר לבן",
      "✏️ עט, עיפרון או צבעים",
      "💡 תאורה טובה מכל הכיוונים",
      "📐 כל הציור בתוך התמונה",
      "🖼️ ללא חיתוכים בקצוות"
    ],
    accept: "image/*",
    exampleImage: "https://via.placeholder.com/400x300?text=Drawing+Example"
  }
};

export default function ImageUploadGuide({ guideType = "handwriting", onImageSelected }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageQuality, setImageQuality] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const guide = GUIDE_CONTENT[guideType];

  const analyzeImageQuality = async (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          const aspectRatio = width / height;

          let quality = {
            overall: 0,
            resolution: 0,
            aspectRatio: 0,
            fileSize: 0,
            issues: [],
            suggestions: []
          };

          // Resolution check
          if (width >= 1920 && height >= 1080) {
            quality.resolution = 1.0;
          } else if (width >= 1280 && height >= 720) {
            quality.resolution = 0.8;
          } else if (width >= 800 && height >= 600) {
            quality.resolution = 0.6;
          } else {
            quality.resolution = 0.3;
            quality.issues.push("רזולוציה נמוכה מדי");
            quality.suggestions.push("צלם שוב ברזולוציה גבוהה יותר");
          }

          // Aspect ratio check
          if (guideType === "palm") {
            if (aspectRatio >= 0.7 && aspectRatio <= 1.3) {
              quality.aspectRatio = 1.0;
            } else {
              quality.aspectRatio = 0.5;
              quality.issues.push("פרופורציות לא נכונות");
              quality.suggestions.push("וודא שכף היד בפריים המלא");
            }
          } else {
            if (aspectRatio >= 0.7 && aspectRatio <= 1.5) {
              quality.aspectRatio = 1.0;
            } else {
              quality.aspectRatio = 0.6;
            }
          }

          // File size check
          const fileSizeMB = file.size / (1024 * 1024);
          if (fileSizeMB > 0.5 && fileSizeMB < 10) {
            quality.fileSize = 1.0;
          } else if (fileSizeMB <= 0.5) {
            quality.fileSize = 0.6;
            quality.issues.push("קובץ קטן מדי");
            quality.suggestions.push("צלם ברזולוציה גבוהה יותר");
          } else {
            quality.fileSize = 0.8;
          }

          quality.overall = (quality.resolution + quality.aspectRatio + quality.fileSize) / 3;

          if (quality.overall < 0.6) {
            quality.issues.push("איכות תמונה כללית נמוכה");
            quality.suggestions.push("עקוב אחר ההנחיות וצלם שוב");
          }

          resolve(quality);
        };
        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      EnhancedToast.error('קובץ לא חוקי', 'נא להעלות תמונה בלבד');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      EnhancedToast.error('קובץ גדול מדי', 'התמונה חייבת להיות עד 10MB');
      return;
    }

    setIsAnalyzing(true);
    const preview = URL.createObjectURL(file);
    setSelectedImage({ file, preview });

    try {
      const quality = await analyzeImageQuality(file);
      setImageQuality(quality);

      if (quality.overall < 0.5) {
        EnhancedToast.warning('איכות תמונה נמוכה', 'מומלץ לצלם שוב בתנאים טובים יותר');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      setImageQuality({ overall: 0.7, issues: [], suggestions: [] });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    if (selectedImage && imageQuality) {
      onImageSelected(selectedImage.file, imageQuality);
    }
  };

  const handleReset = () => {
    if (selectedImage?.preview) {
      URL.revokeObjectURL(selectedImage.preview);
    }
    setSelectedImage(null);
    setImageQuality(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (useCamera) => {
    if (fileInputRef.current) {
      // אם רוצים מצלמה, מוסיפים את ה-capture attribute
      if (useCamera) {
        fileInputRef.current.setAttribute('capture', 'environment');
      } else {
        fileInputRef.current.removeAttribute('capture');
      }
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-indigo-900/50 border-indigo-700/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-6 h-6 text-indigo-300 shrink-0 mt-1" />
            <div>
              <h3 className="text-indigo-200 font-bold text-lg mb-3">{guide.title}</h3>
              <ul className="space-y-2">
                {guide.tips.map((tip, idx) => (
                  <li key={idx} className="text-indigo-100 text-sm flex items-start gap-2">
                    <span className="text-indigo-400 shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {!selectedImage ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={guide.accept}
              onChange={handleImageChange}
              className="hidden"
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                onClick={() => handleFileSelect(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-20 text-lg"
              >
                <Camera className="w-6 h-6 ml-2" />
                צלם עכשיו
              </Button>

              <Button
                onClick={() => handleFileSelect(false)}
                variant="outline"
                className="border-2 border-purple-600 text-purple-300 hover:bg-purple-900/30 h-20 text-lg"
              >
                <Upload className="w-6 h-6 ml-2" />
                העלה תמונה קיימת
              </Button>
            </div>

            <p className="text-center text-purple-300 text-sm">
              📸 מומלץ לצלם ישירות לתוצאות מיטביות
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="bg-gray-900/80 border-purple-700/30">
              <CardContent className="p-6 space-y-6">
                <div className="relative">
                  <img
                    src={selectedImage.preview}
                    alt="Preview"
                    className="w-full max-h-96 object-contain rounded-xl border-2 border-purple-600/50"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-white text-lg">מנתח איכות תמונה...</p>
                      </div>
                    </div>
                  )}
                </div>

                {imageQuality && !isAnalyzing && (
                  <ImageQualityIndicator quality={imageQuality} />
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1 border-red-600 text-red-300 hover:bg-red-900/30"
                  >
                    צלם שוב
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={isAnalyzing || (imageQuality && imageQuality.overall < 0.4)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-5 h-5 ml-2" />
                    {imageQuality && imageQuality.overall < 0.6 ? 'המשך בכל זאת' : 'נראה מצוין!'}
                  </Button>
                </div>

                {imageQuality && imageQuality.overall < 0.6 && (
                  <div className="bg-orange-900/30 border border-orange-700/50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-orange-200 font-semibold mb-2">💡 איכות התמונה יכולה להשתפר:</p>
                        <ul className="text-orange-100 text-sm space-y-1">
                          {imageQuality.suggestions.map((sug, idx) => (
                            <li key={idx}>• {sug}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}