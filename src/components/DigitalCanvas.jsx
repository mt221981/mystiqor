import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Pencil, Eraser, RotateCcw, Trash2, Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

/**
 * SIMPLE DIGITAL CANVAS
 * קנבס ציור פשוט וידידותי למשתמש
 */

export default function DigitalCanvas({ 
  taskName = "ציור",
  taskInstructions = "צייר באופן חופשי",
  onSave,
  onCancel
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pencil');
  const [brushSize, setBrushSize] = useState(3);
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [strokeMetadata, setStrokeMetadata] = useState([]);
  const [encouragement, setEncouragement] = useState(null);

  const canvasWidth = 800;
  const canvasHeight = 600;

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    redrawCanvas();
  }, []);

  // Redraw all strokes
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    strokes.forEach(stroke => drawStroke(ctx, stroke));
  };

  // Draw a stroke
  const drawStroke = (ctx, stroke) => {
    if (!stroke || stroke.points.length < 2) return;
    
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
    
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    
    for (let i = 1; i < stroke.points.length; i++) {
      const xc = (stroke.points[i].x + stroke.points[i - 1].x) / 2;
      const yc = (stroke.points[i].y + stroke.points[i - 1].y) / 2;
      ctx.quadraticCurveTo(stroke.points[i - 1].x, stroke.points[i - 1].y, xc, yc);
    }
    
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  };

  // Get canvas coordinates
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY, pressure = 0.5;
    
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      pressure = e.touches[0].force || 0.5;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
      pressure = e.pressure || 0.5;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      pressure: pressure,
      timestamp: Date.now()
    };
  };

  // Drawing handlers
  const startDrawing = (e) => {
    e.preventDefault();
    const coords = getCanvasCoordinates(e);
    if (!coords) return;
    
    setIsDrawing(true);
    
    const newStroke = {
      tool: tool,
      color: tool === 'pencil' ? '#000000' : '#FFFFFF',
      width: tool === 'pencil' ? brushSize : 20,
      points: [coords],
      startTime: Date.now(),
      pressures: [coords.pressure]
    };
    
    setCurrentStroke(newStroke);
  };

  const draw = (e) => {
    if (!isDrawing || !currentStroke) return;
    e.preventDefault();
    
    const coords = getCanvasCoordinates(e);
    if (!coords) return;
    
    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, coords],
      pressures: [...currentStroke.pressures, coords.pressure]
    };
    
    setCurrentStroke(updatedStroke);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawStroke(ctx, updatedStroke);
  };

  const stopDrawing = (e) => {
    if (!isDrawing || !currentStroke) return;
    e.preventDefault();
    
    setIsDrawing(false);
    
    const finalStroke = {
      ...currentStroke,
      endTime: Date.now(),
      duration: Date.now() - currentStroke.startTime
    };
    
    const metadata = calculateStrokeMetadata(finalStroke);
    
    const newStrokes = [...strokes, finalStroke];
    setStrokes(newStrokes);
    setStrokeMetadata(prev => [...prev, metadata]);
    
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newStrokes);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    
    setCurrentStroke(null);
    
    // Show encouragement
    if (newStrokes.length === 5) {
      setEncouragement('יפה מאוד! 👏');
      setTimeout(() => setEncouragement(null), 2000);
    } else if (newStrokes.length === 15) {
      setEncouragement('אתה מתקדם נהדר! 🎨');
      setTimeout(() => setEncouragement(null), 2000);
    }
  };

  // Calculate stroke metadata
  const calculateStrokeMetadata = (stroke) => {
    const points = stroke.points;
    const pressures = stroke.pressures;
    
    const speeds = [];
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i-1].x;
      const dy = points[i].y - points[i-1].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const timeDiff = points[i].timestamp - points[i-1].timestamp;
      const speed = timeDiff > 0 ? distance / timeDiff : 0;
      speeds.push(speed);
    }
    
    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
    const avgPressure = pressures.reduce((a, b) => a + b, 0) / pressures.length;
    const pressureVariance = pressures.reduce((sum, p) => sum + Math.pow(p - avgPressure, 2), 0) / pressures.length;
    
    let directionChanges = 0;
    for (let i = 2; i < points.length; i++) {
      const dx1 = points[i-1].x - points[i-2].x;
      const dy1 = points[i-1].y - points[i-2].y;
      const dx2 = points[i].x - points[i-1].x;
      const dy2 = points[i].y - points[i-1].y;
      
      const angle1 = Math.atan2(dy1, dx1);
      const angle2 = Math.atan2(dy2, dx2);
      const angleDiff = Math.abs(angle2 - angle1);
      
      if (angleDiff > Math.PI / 4) {
        directionChanges++;
      }
    }
    
    const smoothness = 1 - (directionChanges / Math.max(points.length - 2, 1));
    
    return {
      duration: stroke.duration,
      points_count: points.length,
      average_speed: avgSpeed,
      average_pressure: avgPressure,
      pressure_variance: pressureVariance,
      smoothness: smoothness
    };
  };

  // Undo
  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setStrokes(history[historyStep - 1] || []);
      redrawCanvas();
    }
  };

  // Clear
  const handleClear = () => {
    setStrokes([]);
    setStrokeMetadata([]);
    const newHistory = [...history, []];
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Save
  const handleSave = async () => {
    const canvas = canvasRef.current;
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `drawing_${Date.now()}.png`, { type: 'image/png' });
      
      const comprehensiveMetadata = {
        strokes: strokeMetadata,
        total_strokes: strokeMetadata.length,
        total_drawing_time: strokeMetadata.reduce((sum, s) => sum + s.duration, 0),
        average_speed: strokeMetadata.reduce((sum, s) => sum + s.average_speed, 0) / strokeMetadata.length,
        average_pressure: strokeMetadata.reduce((sum, s) => sum + s.average_pressure, 0) / strokeMetadata.length,
        pressure_variance: strokeMetadata.reduce((sum, s) => sum + s.pressure_variance, 0) / strokeMetadata.length,
        erasures: strokes.filter(s => s.tool === 'eraser').length,
        canvas_dimensions: { width: canvasWidth, height: canvasHeight },
        drawing_date: new Date().toISOString()
      };
      
      onSave(file, comprehensiveMetadata);
    }, 'image/png');
  };

  const canUndo = historyStep > 0;

  return (
    <div className="space-y-4">
      {/* Simple Instructions */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="text-4xl">✨</div>
            <div className="flex-1">
              <h3 className="text-white text-2xl font-bold mb-2">{taskName}</h3>
              <p className="text-white text-lg leading-relaxed mb-4">{taskInstructions}</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white/20 text-white text-sm">✓ אין נכון ולא נכון</Badge>
                <Badge className="bg-white/20 text-white text-sm">✓ צייר בחופשיות</Badge>
                <Badge className="bg-white/20 text-white text-sm">✓ קח את הזמן שלך</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simple Toolbar */}
      <Card className="bg-gray-900/80 border-purple-700/30">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Tool Selection */}
            <div className="flex gap-2">
              <Button
                onClick={() => setTool('pencil')}
                variant={tool === 'pencil' ? 'default' : 'outline'}
                size="lg"
                className={tool === 'pencil' ? 'bg-purple-600 text-lg' : 'text-lg'}
              >
                <Pencil className="w-5 h-5 ml-2" />
                עיפרון
              </Button>
              <Button
                onClick={() => setTool('eraser')}
                variant={tool === 'eraser' ? 'default' : 'outline'}
                size="lg"
                className={tool === 'eraser' ? 'bg-purple-600 text-lg' : 'text-lg'}
              >
                <Eraser className="w-5 h-5 ml-2" />
                מחק
              </Button>
            </div>

            <div className="h-8 w-px bg-gray-600" />

            {/* Size Control */}
            {tool === 'pencil' && (
              <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                <span className="text-white text-lg whitespace-nowrap">עובי:</span>
                <Slider
                  value={[brushSize]}
                  onValueChange={(values) => setBrushSize(values[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(size => (
                    <div
                      key={size}
                      className={`w-2 h-2 rounded-full bg-white transition-opacity ${
                        size <= Math.ceil(brushSize / 2) ? 'opacity-100' : 'opacity-30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="h-8 w-px bg-gray-600" />

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleUndo}
                disabled={!canUndo}
                variant="outline"
                size="lg"
                className="text-lg"
              >
                <RotateCcw className="w-5 h-5 ml-1" />
                בטל
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                size="lg"
                className="text-red-400 hover:text-red-300 text-lg"
              >
                <Trash2 className="w-5 h-5 ml-1" />
                נקה
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="bg-gray-900/80 border-purple-700/30 overflow-hidden relative">
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto bg-white">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="max-w-full h-auto shadow-2xl cursor-crosshair"
              style={{ 
                touchAction: 'none',
                maxHeight: '70vh'
              }}
            />
          </div>

          {/* Encouragement Popup */}
          <AnimatePresence>
            {encouragement && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl"
              >
                <div className="flex items-center gap-2 text-lg font-bold">
                  <Sparkles className="w-5 h-5" />
                  {encouragement}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Simple Progress Indicator */}
      {strokes.length > 0 && (
        <Card className="bg-green-900/30 border-green-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div className="flex-1">
                <p className="text-green-200 font-semibold">
                  נהדר! הציור שלך מתקדם יפה 🎨
                </p>
                <p className="text-green-300 text-sm">
                  {strokes.length} קווים ציירת עד כה
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="outline"
            size="lg"
            className="flex-1 text-lg"
          >
            חזור
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={strokes.length === 0}
          size="lg"
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-xl py-6"
        >
          <Check className="w-6 h-6 ml-2" />
          סיימתי לצייר - שמור
        </Button>
      </div>

      {/* Helper Text */}
      <p className="text-center text-purple-300 text-base leading-relaxed">
        💡 אל תדאג לאיכות הציור - הציור החופשי שלך הוא הכי טוב לניתוח!
      </p>
    </div>
  );
}