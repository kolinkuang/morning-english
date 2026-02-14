import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Copy, RefreshCw, CheckCircle, Video, RotateCw, BookOpen, Mic2, BookMarked, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import DayCard from "./DayCard";

export default function ResultDisplay({ result, onReset, onResearch }) {
  const [showExplanations, setShowExplanations] = useState(false);
  const queryClient = useQueryClient();

  // 获取当前用户的进度
  const { data: userProgress } = useQuery({
    queryKey: ['userProgress', result.id],
    queryFn: async () => {
      const progressList = await base44.entities.UserProgress.filter({
        video_record_id: result.id
      });
      return progressList[0] || null;
    },
    enabled: !!result.id
  });

  // 创建或更新进度
  const updateProgressMutation = useMutation({
    mutationFn: async (completedDays) => {
      if (userProgress) {
        return base44.entities.UserProgress.update(userProgress.id, {
          completed_days: completedDays
        });
      } else {
        return base44.entities.UserProgress.create({
          video_record_id: result.id,
          completed_days: completedDays
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress', result.id] });
    }
  });

  const handleToggleComplete = (dayNumber) => {
    const currentCompleted = userProgress?.completed_days || [];
    const newCompleted = currentCompleted.includes(dayNumber)
      ? currentCompleted.filter(d => d !== dayNumber)
      : [...currentCompleted, dayNumber].sort();

    updateProgressMutation.mutate(newCompleted);

    if (!currentCompleted.includes(dayNumber)) {
      toast.success(`Day ${dayNumber} marked as complete! 🎉`);
    }
  };
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label}已复制到剪贴板`);
  };

  const copyAll = () => {
    const fullContent = `
视频链接: ${result.video_url}

===== 五天内容 =====

【Day 1】
开场白: ${result.day1_intro}
对话: ${result.day1_content}

【Day 2】
开场白: ${result.day2_intro}
对话: ${result.day2_content}

【Day 3】
开场白: ${result.day3_intro}
对话: ${result.day3_content}

【Day 4】
开场白: ${result.day4_intro}
对话: ${result.day4_content}

【Day 5】
开场白: ${result.day5_intro}
对话: ${result.day5_content}
    `.trim();

    navigator.clipboard.writeText(fullContent);
    toast.success("全部内容已复制到剪贴板");
  };

  const days = [
    { content: result.day1_content, intro: result.day1_intro },
    { content: result.day2_content, intro: result.day2_intro },
    { content: result.day3_content, intro: result.day3_intro },
    { content: result.day4_content, intro: result.day4_intro },
    { content: result.day5_content, intro: result.day5_intro },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 成功提示 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          内容生成完成
        </div>
      </motion.div>

      {/* 视频链接卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {result.video_title || result.topic}
                  </h3>
                  <p className="text-white/70 text-sm truncate max-w-md">
                    {result.video_url}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(result.video_url, "视频链接")}
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                  title="复制链接"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                  title="打开视频"
                >
                  <a href={result.video_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>

              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-3 flex-wrap">
        <Button
          variant="outline"
          onClick={onReset}
          className="rounded-xl"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          搜索新主题
        </Button>
        <Button
          variant="outline"
          onClick={onResearch}
          className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
        >
          <RotateCw className="w-4 h-4 mr-2" />
          重新搜索此主题
        </Button>
        <Button
          onClick={copyAll}
          className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600"
        >
          <Copy className="w-4 h-4 mr-2" />
          复制全部内容
        </Button>
      </div>

      {/* AI 解释 */}
      {(result.topic_explanation || result.pronunciation_tips || result.grammar_points || result.vocabulary_notes) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-xl">
            <CardHeader
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowExplanations(!showExplanations)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Learning Explanations</CardTitle>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Pronunciation, Grammar, Vocabulary & Topic Overview
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  {showExplanations ? 'Hide' : 'Show'}
                </Button>
              </div>
            </CardHeader>

            <AnimatePresence>
              {showExplanations && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="space-y-6 pt-0">
                    {result.topic_explanation && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-800">Topic Overview</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed pl-7">{result.topic_explanation}</p>
                      </div>
                    )}

                    {result.pronunciation_tips && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mic2 className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-gray-800">Pronunciation Tips</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap pl-7">{result.pronunciation_tips}</p>
                      </div>
                    )}

                    {result.grammar_points && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BookMarked className="w-5 h-5 text-purple-600" />
                          <h3 className="font-semibold text-gray-800">Grammar Points</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap pl-7">{result.grammar_points}</p>
                      </div>
                    )}

                    {result.vocabulary_notes && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-orange-600" />
                          <h3 className="font-semibold text-gray-800">Advanced Vocabulary</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap pl-7">{result.vocabulary_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      )}

      {/* 五天内容 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {days.map((day, index) => (
          <DayCard
            key={index}
            dayNumber={index + 1}
            content={day.content}
            intro={day.intro}
            delay={index}
          />
        ))}
      </div>
      </div>
      );
      }