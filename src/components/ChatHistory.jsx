import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, Clock, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function ChatHistory({ onSelectConversation, currentConversationId }) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: conversations = [], isLoading, refetch } = useQuery({
    queryKey: ['chatConversations'],
    queryFn: async () => {
      const convs = await base44.entities.Conversation.list('-last_message_date', 50);
      return convs;
    },
    staleTime: 60000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const handleDelete = async (convId, e) => {
    e?.stopPropagation();
    if (!confirm('למחוק שיחה זו?')) return;
    
    try {
      await base44.entities.Conversation.delete(convId);
      await refetch();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.title?.toLowerCase().includes(query) ||
      conv.conversation_type?.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <Card className="bg-gray-900/90 border-purple-700/50">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          <span className="text-purple-300 mr-3">טוען שיחות...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/90 border-purple-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          היסטוריית שיחות
          <Badge className="bg-purple-600/50 text-purple-200">
            {conversations.length}
          </Badge>
        </CardTitle>
        
        <div className="relative mt-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חפש שיחות..."
            className="pr-10 bg-gray-800/50 border-purple-700/30 text-white placeholder:text-gray-500"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
        {filteredConversations.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">
              {searchQuery ? 'לא נמצאו שיחות' : 'התחל שיחה חדשה'}
            </p>
          </div>
        )}

        {filteredConversations.map((conv, idx) => (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`group rounded-lg p-3 cursor-pointer transition-all ${
              conv.id === currentConversationId
                ? 'bg-purple-600/30 border-purple-500/50 border'
                : 'bg-gray-800/50 hover:bg-gray-800/80 border border-transparent'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div 
                className="flex-1 min-w-0"
                onClick={() => onSelectConversation(conv)}
              >
                <h4 className="text-white font-semibold text-sm truncate mb-1">
                  {conv.title || 'שיחה ללא כותרת'}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <Clock className="w-3 h-3" />
                  {conv.last_message_date && format(
                    new Date(conv.last_message_date),
                    'dd/MM/yyyy HH:mm',
                    { locale: he }
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-900/50 text-blue-300 text-xs">
                    {conv.conversation_type || 'כללי'}
                  </Badge>
                  {conv.messages_count > 0 && (
                    <span className="text-xs text-gray-500">
                      {conv.messages_count} הודעות
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onSelectConversation(conv)}
                  className="text-purple-400 hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => handleDelete(conv.id, e)}
                  className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}