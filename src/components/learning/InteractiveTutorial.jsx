import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowLeft, ArrowRight, BookOpen, Star } from "lucide-react";

export default function InteractiveTutorial({ module, onComplete, onProgress }) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    
    const currentStep = module.steps[currentStepIndex];
    const progress = ((completedSteps.length) / module.steps.length) * 100;

    const handleNext = () => {
        if (!completedSteps.includes(currentStep.id)) {
            const newCompleted = [...completedSteps, currentStep.id];
            setCompletedSteps(newCompleted);
            if (onProgress) onProgress(newCompleted.length, module.steps.length);
        }

        if (currentStepIndex < module.steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            if (onComplete) onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header / Progress */}
            <div className="mb-6 space-y-2">
                <div className="flex justify-between items-center text-slate-300">
                    <span className="text-sm font-medium">שיעור: {module.title}</span>
                    <span className="text-sm">{Math.round(progress)}% הושלם</span>
                </div>
                <Progress value={progress} className="h-2 bg-slate-800" />
            </div>

            {/* Content Card */}
            <Card className="bg-slate-900/80 border-purple-500/30 backdrop-blur-xl overflow-hidden min-h-[400px] flex flex-col relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex flex-col"
                    >
                        {/* Step Image/Visual */}
                        {currentStep.image && (
                            <div className="h-48 w-full bg-slate-800 overflow-hidden">
                                <img src={currentStep.image} alt="Step visual" className="w-full h-full object-cover" />
                            </div>
                        )}

                        <CardContent className="p-8 flex-1 flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/30">
                                    צעד {currentStepIndex + 1}
                                </span>
                                <h2 className="text-2xl font-bold text-white">{currentStep.title}</h2>
                            </div>

                            <div className="prose prose-invert max-w-none mb-8 text-slate-300 text-lg leading-relaxed">
                                {currentStep.content}
                            </div>

                            {/* Interaction (Quiz/Action) Placeholder */}
                            {currentStep.interaction && (
                                <div className="mt-auto bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                    <h4 className="text-purple-300 font-bold mb-2 flex items-center gap-2">
                                        <Star className="w-4 h-4" />
                                        תרגול מהיר
                                    </h4>
                                    <p className="text-sm text-slate-400">{currentStep.interaction}</p>
                                </div>
                            )}
                        </CardContent>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Footer */}
                <div className="p-6 border-t border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <Button 
                        variant="ghost" 
                        onClick={handlePrev} 
                        disabled={currentStepIndex === 0}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        <ArrowRight className="w-4 h-4 ml-2" />
                        הקודם
                    </Button>

                    <Button 
                        onClick={handleNext}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
                    >
                        {currentStepIndex === module.steps.length - 1 ? (
                            <>
                                סיים שיעור
                                <CheckCircle className="w-4 h-4 mr-2" />
                            </>
                        ) : (
                            <>
                                הבא
                                <ArrowLeft className="w-4 h-4 mr-2" />
                            </>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}