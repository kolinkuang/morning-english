import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Sparkles, Video, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export default function TopicInput({ onSubmit, isLoading }) {
  const [topic, setTopic] = useState('');
  const [source, setSource] = useState('bilibili');
  const [difficulty, setDifficulty] = useState('intermediate');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic.trim(), source, difficulty);
    }
  };

  const suggestions = [
    "Ordering at a restaurant",
    "Job interview",
    "Making phone calls",
    "Airport & travel",
    "Doctor's appointment",
    "Shopping conversation"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              输入视频主题
            </h2>
            <p className="text-gray-500 text-sm">
              我们将为您找到适合英语晨读的对话视频
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="例如：Ordering at a coffee shop"
                className="pl-12 h-14 text-lg border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  视频来源
                </label>
                <Select value={source} onValueChange={setSource} disabled={isLoading}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bilibili">Bilibili 哔哩哔哩</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="wechat">微信视频号</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  难度等级
                </label>
                <Select value={difficulty} onValueChange={setDifficulty} disabled={isLoading}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">初级 Beginner</SelectItem>
                    <SelectItem value="intermediate">中级 Intermediate</SelectItem>
                    <SelectItem value="advanced">高级 Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!topic.trim() || isLoading}
              className="w-full h-14 text-lg font-medium bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  正在寻找视频...
                </div>
              ) : (
                "开始搜索"
              )}
            </Button>
          </form>

          <div className="mt-8">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 text-center">
              热门主题建议
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setTopic(suggestion)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors duration-200 disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}