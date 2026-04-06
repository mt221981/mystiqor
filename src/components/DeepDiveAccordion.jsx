import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Brain, Heart, Users, Zap, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SECTION_CONFIG = {
  intelligence_and_thinking: {
    title: "🧠 אינטליגנציה וחשיבה",
    icon: Brain,
    color: "blue"
  },
  emotional_world: {
    title: "💖 עולם רגשי",
    icon: Heart,
    color: "pink"
  },
  social_relations: {
    title: "🤝 יחסים חברתיים",
    icon: Users,
    color: "purple"
  },
  motivation_and_drive: {
    title: "🔥 מוטיבציה ודחף",
    icon: Zap,
    color: "orange"
  },
  work_style: {
    title: "💼 סגנון עבודה",
    icon: Briefcase,
    color: "indigo"
  }
};

export default function DeepDiveAccordion({ sections }) {
  const [expandedSection, setExpandedSection] = useState(null);

  if (!sections) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-3xl font-bold text-white">צלילה עמוקה - 5 ממדים</h2>
        <Badge className="bg-yellow-600 text-white">תיאורטי</Badge>
      </div>

      {Object.entries(sections).map(([key, content]) => {
        const config = SECTION_CONFIG[key];
        if (!config || !content) return null;

        const isExpanded = expandedSection === key;
        const Icon = config.icon;

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={`bg-${config.color}-900/50 border-${config.color}-700/30 overflow-hidden`}>
              <button
                onClick={() => setExpandedSection(isExpanded ? null : key)}
                className={`w-full p-6 flex items-center justify-between hover:bg-${config.color}-800/20 transition-colors`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${config.color}-600 to-${config.color}-700 rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-2xl font-bold text-${config.color}-200 text-right`}>
                    {config.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`bg-${config.color}-700 text-white`}>
                    {content.length} תווים
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className={`w-6 h-6 text-${config.color}-300`} />
                  ) : (
                    <ChevronDown className={`w-6 h-6 text-${config.color}-300`} />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`p-6 border-t border-${config.color}-700/30 bg-${config.color}-800/20`}>
                      <p className={`text-${config.color}-100 text-lg leading-relaxed whitespace-pre-wrap`}>
                        {content}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}