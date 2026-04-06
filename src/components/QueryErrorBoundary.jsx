import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function QueryErrorBoundary({ error, reset, message }) {
  return (
    <Card className="bg-gray-900/80 border-red-700/50">
      <CardContent className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-white font-semibold mb-2">
          {message || 'שגיאה בטעינת נתונים'}
        </p>
        {error?.message && (
          <p className="text-gray-400 text-sm mb-4">{error.message}</p>
        )}
        {reset && (
          <Button
            onClick={reset}
            variant="outline"
            className="border-red-700 text-red-300 hover:bg-red-900/20"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            נסה שוב
          </Button>
        )}
      </CardContent>
    </Card>
  );
}