import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mic } from "lucide-react";
import { motion } from "framer-motion";

export default function DayCard({ dayNumber, content, intro, delay = 0 }) {
  const dayColors = [
    "from-blue-500 to-cyan-500",
    "from-indigo-500 to-purple-500",
    "from-purple-500 to-pink-500",
    "from-pink-500 to-rose-500",
    "from-orange-500 to-amber-500"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <CardHeader className={`bg-gradient-to-r ${dayColors[dayNumber - 1]} p-4`}>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-sm font-medium">
              Day {dayNumber}
            </Badge>
            <span className="text-white/80 text-xs">第{dayNumber}天</span>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {/* 开场白 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Mic className="w-4 h-4" />
              <span>开场白 Introduction</span>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <p className="text-gray-700 text-sm leading-relaxed italic">
                "{intro}"
              </p>
            </div>
          </div>

          {/* 对话内容 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <MessageSquare className="w-4 h-4" />
              <span>对话内容 Dialogue</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                {content}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}