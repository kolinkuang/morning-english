import React from 'react';
import { motion } from "framer-motion";
import { Search, FileText, Scissors, Sparkles } from "lucide-react";

export default function ProcessingAnimation({ step }) {
  const steps = [
    { icon: Search, label: "搜索合适的视频", description: "正在寻找符合主题的英语对话视频..." },
    { icon: FileText, label: "提取对话文本", description: "正在从视频中提取对话内容..." },
    { icon: Scissors, label: "拆分五天内容", description: "正在将对话平均分配到五天..." },
    { icon: Sparkles, label: "生成开场白", description: "正在为每天内容撰写英文开场白..." },
    { icon: Sparkles, label: "生成AI解释", description: "正在生成发音、语法和词汇解释..." },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
            <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              {React.createElement(steps[step]?.icon || Search, {
                className: "w-8 h-8 text-white"
              })}
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {steps[step]?.label || "处理中..."}
          </h3>
          <p className="text-gray-500 text-sm">
            {steps[step]?.description || "请稍候..."}
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = index === step;
            const isComplete = index < step;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0.5 }}
                animate={{
                  opacity: isActive || isComplete ? 1 : 0.5,
                  scale: isActive ? 1.02 : 1
                }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  isActive ? 'bg-blue-50 border border-blue-200' :
                  isComplete ? 'bg-green-50 border border-green-200' :
                  'bg-gray-50 border border-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-blue-500' :
                  isComplete ? 'bg-green-500' :
                  'bg-gray-300'
                }`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className={`text-sm font-medium ${
                  isActive ? 'text-blue-700' :
                  isComplete ? 'text-green-700' :
                  'text-gray-400'
                }`}>
                  {s.label}
                </span>
                {isComplete && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto text-green-500 text-xs"
                  >
                    ✓
                  </motion.span>
                )}
                {isActive && (
                  <div className="ml-auto w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}