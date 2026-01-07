import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ImageComparisonView({ imageUrl }) {
  const [zoom, setZoom] = useState(1);
  const [showFullscreen, setShowFullscreen] = useState(false);

  if (!imageUrl) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gray-900/60 border-gray-700/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-gray-300" />
                <h3 className="text-xl font-bold text-white">כתב היד המקורי</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                  className="border-gray-600 text-gray-300"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                  className="border-gray-600 text-gray-300"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFullscreen(true)}
                  className="border-gray-600 text-gray-300"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl overflow-auto max-h-96">
              <div className="inline-block min-w-full">
                <img
                  src={imageUrl}
                  alt="כתב יד מקורי"
                  style={{ 
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top right',
                    transition: 'transform 0.3s ease'
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="text-gray-400 text-sm">זום: {Math.round(zoom * 100)}%</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {showFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <div className="relative max-w-7xl max-h-full">
            <img
              src={imageUrl}
              alt="כתב יד מקורי"
              className="max-w-full max-h-full object-contain"
            />
            <Button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 left-4 bg-red-600 hover:bg-red-700"
            >
              סגור
            </Button>
          </div>
        </motion.div>
      )}
    </>
  );
}