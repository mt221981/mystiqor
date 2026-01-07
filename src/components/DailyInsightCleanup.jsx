import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * AUTO-CLEANUP COMPONENT v2.0
 * Uses backend function with service role to delete invalid records
 */
export default function DailyInsightCleanup() {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('בודק נתונים...');

  useEffect(() => {
    const cleanup = async () => {
      try {
        console.log('[DailyInsightCleanup] Starting cleanup via backend...');
        setStatus('checking');
        setMessage('מנקה נתונים ישנים...');

        // Call backend function to delete with service role
        const response = await base44.functions.invoke('cleanupDailyInsights', {});
        
        console.log('[DailyInsightCleanup] Cleanup response:', response);

        if (response.data && response.data.deleted > 0) {
          setStatus('success');
          setMessage(`✅ נמחקו ${response.data.deleted} רשומות ישנות!`);
          
          console.log('[DailyInsightCleanup] Cleanup complete, reloading...');
          
          setTimeout(() => {
            window.location.reload(true);
          }, 2000);
        } else {
          setStatus('success');
          setMessage('✅ כל הנתונים תקינים');
          
          // Hide after 2 seconds
          setTimeout(() => {
            setStatus('hidden');
          }, 2000);
        }

      } catch (error) {
        console.error('[DailyInsightCleanup] Error:', error);
        setStatus('error');
        setMessage('❌ שגיאה בניקוי: ' + error.message);
      }
    };

    cleanup();
  }, []);

  if (status === 'hidden') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <Card className="bg-gray-900 border-purple-700 max-w-md w-full mx-4">
        <CardContent className="p-8 text-center">
          {status === 'checking' && (
            <>
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-2">מנקה נתונים...</h3>
              <p className="text-purple-200">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-2">הושלם!</h3>
              <p className="text-green-200 mb-2">{message}</p>
              <p className="text-gray-400 text-sm">הדף יתרענן בעוד שניה...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-2">שגיאה</h3>
              <p className="text-red-200 mb-4">{message}</p>
              <div className="text-left bg-red-950/50 rounded-lg p-4 text-sm">
                <p className="text-red-100 font-bold mb-2">💡 פתרון ידני:</p>
                <ol className="text-red-200 space-y-1 list-decimal mr-4">
                  <li>לך ל-Dashboard → Data → DailyInsight</li>
                  <li>מחק את כל הרשומות</li>
                  <li>רענן את הדף (Ctrl+Shift+R)</li>
                </ol>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}