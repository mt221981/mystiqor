import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

export default function IconGenerator() {
  const canvasRefs = useRef({});
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

  useEffect(() => {
    sizes.forEach(size => {
      const canvas = canvasRefs.current[size];
      if (canvas) {
        drawIcon(canvas, size);
      }
    });
  }, []);

  const drawIcon = (canvas, size) => {
    const ctx = canvas.getContext('2d');
    const scale = size / 512;
    
    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, size, size);
    bgGradient.addColorStop(0, '#000000');
    bgGradient.addColorStop(0.5, '#4c1d95');
    bgGradient.addColorStop(1, '#1e1b4b');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, size, size);
    
    // Center
    const cx = size / 2;
    const cy = size / 2;
    
    // Mystical circles
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, 180 * scale, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.beginPath();
    ctx.arc(cx, cy, 150 * scale, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Glow
    const glowGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200 * scale);
    glowGradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
    glowGradient.addColorStop(1, 'rgba(124, 58, 237, 0)');
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 200 * scale, 0, 2 * Math.PI);
    ctx.fill();
    
    // Moon gradient
    const moonGradient = ctx.createLinearGradient(cx - 50 * scale, cy - 70 * scale, cx + 50 * scale, cy + 70 * scale);
    moonGradient.addColorStop(0, '#7c3aed');
    moonGradient.addColorStop(0.5, '#a855f7');
    moonGradient.addColorStop(1, '#ec4899');
    
    // Draw crescent moon
    ctx.fillStyle = moonGradient;
    ctx.beginPath();
    ctx.arc(cx - 20 * scale, cy, 60 * scale, 0.5 * Math.PI, 1.5 * Math.PI, false);
    ctx.arc(cx + 10 * scale, cy, 40 * scale, 1.5 * Math.PI, 0.5 * Math.PI, true);
    ctx.closePath();
    ctx.fill();
    
    // Inner glow on moon
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(cx - 15 * scale, cy, 50 * scale, 0.5 * Math.PI, 1.5 * Math.PI, false);
    ctx.arc(cx + 5 * scale, cy, 35 * scale, 1.5 * Math.PI, 0.5 * Math.PI, true);
    ctx.closePath();
    ctx.fill();
    
    // Stars
    const stars = [
      { x: cx + 60 * scale, y: cy - 50 * scale, r: 4 * scale },
      { x: cx - 80 * scale, y: cy + 40 * scale, r: 3 * scale },
      { x: cx + 70 * scale, y: cy + 60 * scale, r: 3 * scale }
    ];
    
    ctx.fillStyle = '#fbbf24';
    stars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Sparkles
    ctx.fillStyle = '#a78bfa';
    const sparkles = [
      { x: cx + 50 * scale, y: cy - 70 * scale },
      { x: cx - 60 * scale, y: cy - 40 * scale },
      { x: cx + 80 * scale, y: cy + 20 * scale }
    ];
    
    sparkles.forEach(sparkle => {
      ctx.fillRect(sparkle.x - 2 * scale, sparkle.y - 2 * scale, 4 * scale, 4 * scale);
    });
  };

  const downloadIcon = (size) => {
    const canvas = canvasRefs.current[size];
    const link = document.createElement('a');
    link.download = `icon-${size}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadAll = () => {
    sizes.forEach((size, index) => {
      setTimeout(() => {
        downloadIcon(size);
      }, index * 500);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-purple-900/30 backdrop-blur-xl border-purple-700/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-3xl text-center">
              🎨 מחולל Icons למסע פנימה
            </CardTitle>
            <p className="text-purple-200 text-center mt-2">
              לחץ על כל כפתור להורדת האייקון בגודל המתאים
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-8">
              <Button
                onClick={downloadAll}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg px-8 py-6"
              >
                <Download className="w-6 h-6 ml-2" />
                הורד את כל האייקונים
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {sizes.map(size => (
                <Card key={size} className="bg-purple-800/20 border-purple-600/30 hover:border-purple-500/50 transition-all">
                  <CardContent className="p-6">
                    <div className="text-center mb-3">
                      <p className="text-purple-300 font-bold text-lg">{size}x{size}</p>
                    </div>
                    <canvas
                      ref={el => canvasRefs.current[size] = el}
                      width={size}
                      height={size}
                      className="w-full h-auto rounded-lg mb-3 border-2 border-purple-700/30"
                    />
                    <Button
                      onClick={() => downloadIcon(size)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="sm"
                    >
                      <Download className="w-4 h-4 ml-2" />
                      הורד
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-indigo-900/30 backdrop-blur-xl border-indigo-700/30">
          <CardHeader>
            <CardTitle className="text-white text-2xl">📝 הוראות</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-white text-right" dir="rtl">
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-bold text-xl">1️⃣</span>
                <span>לחץ על "הורד את כל האייקונים" או הורד כל אחד בנפרד</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-bold text-xl">2️⃣</span>
                <span>שמור את כל הקבצים בתיקייה <code className="bg-purple-800/30 px-2 py-1 rounded">public/</code> של הפרויקט</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-bold text-xl">3️⃣</span>
                <span>ודא ששמות הקבצים: icon-72.png, icon-96.png וכו'</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-bold text-xl">4️⃣</span>
                <span>בדוק ב-Chrome DevTools → Application → Manifest</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-bold text-xl">5️⃣</span>
                <span>Deploy ובדוק שה-PWA מתקין נכון</span>
              </li>
            </ol>

            <div className="mt-8 p-6 bg-green-900/20 rounded-xl border-2 border-green-700/30">
              <h3 className="text-green-300 font-bold text-xl mb-3">✅ Checklist</h3>
              <div className="space-y-2 text-green-200" dir="rtl">
                <div>□ icon-72.png</div>
                <div>□ icon-96.png</div>
                <div>□ icon-128.png</div>
                <div>□ icon-144.png</div>
                <div>□ icon-152.png</div>
                <div>□ icon-192.png ⭐ (חובה)</div>
                <div>□ icon-384.png</div>
                <div>□ icon-512.png ⭐ (חובה)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}