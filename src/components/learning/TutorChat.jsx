import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Send, Bot, User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

export default function TutorChat({ discipline = "general" }) {
    const [messages, setMessages] = useState([
        { role: 'system', content: `שלום! אני המדריך המיסטי שלך ל${discipline === 'numerology' ? 'נומרולוגיה' : discipline === 'astrology' ? 'אסטרולוגיה' : 'מיסטיקה'}. שאל אותי כל שאלה!` }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await base44.functions.invoke('askMysticTutor', {
                question: input,
                discipline: discipline,
                context: "User is in the learning center"
            });
            
            const aiMsg = { role: 'system', content: res.data.answer };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'system', content: "סליחה, הייתה תקלה בתקשורת הקוסמית. נסה שוב." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-slate-900/50 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-white">המדריך המיסטי</h3>
                    <p className="text-xs text-slate-400">זמין לשאלות 24/7</p>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4 space-y-4">
                {messages.map((msg, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i} 
                        className={`flex gap-3 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <Avatar className="w-8 h-8">
                            <AvatarFallback className={msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </AvatarFallback>
                        </Avatar>
                        <div className={`p-3 rounded-2xl max-w-[80%] ${
                            msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                        }`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center animate-pulse">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700">
                             <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        </div>
                    </div>
                )}
            </ScrollArea>

            <form onSubmit={handleSend} className="p-4 bg-slate-800/50 border-t border-slate-700 flex gap-2">
                <Input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="שאל שאלה על החומר הנלמד..."
                    className="bg-slate-900 border-slate-700 text-white"
                />
                <Button type="submit" disabled={isLoading || !input.trim()} className="bg-purple-600 hover:bg-purple-700">
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    );
}