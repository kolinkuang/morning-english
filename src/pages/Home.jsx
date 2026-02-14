import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import TopicInput from '@/components/TopicInput';
import ResultDisplay from '@/components/ResultDisplay';
import ProcessingAnimation from '@/components/ProcessingAnimation';
import { toast } from 'sonner';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState(null);

  // 获取历史记录以避免重复
  const { data: history = [] } = useQuery({
    queryKey: ['videoHistory'],
    queryFn: () => base44.entities.VideoRecord.list('-created_date', 100),
  });

  const processVideo = async (topic, source = 'youtube', difficulty = 'intermediate') => {
    setIsProcessing(true);
    setProcessingStep(0);
    setResult(null);

    try {
      // 获取同主题的历史记录
      const sameTopicHistory = history.filter(h => h.topic === topic);

      // 统计同主题下每个URL出现的次数
      const urlCounts = {};
      sameTopicHistory.forEach(h => {
        if (h.video_url) {
          urlCounts[h.video_url] = (urlCounts[h.video_url] || 0) + 1;
        }
      });

      // 找出已达到2次使用上限的URL
      const bannedUrlsForTopic = Object.keys(urlCounts).filter(url => urlCounts[url] >= 2);

      // 硬编码禁止的视频（虚假或重复的链接）
      const hardcodedBannedUrls = [
        'https://www.bilibili.com/video/BV1Jp421Q7Mc',
        'https://www.bilibili.com/video/BV1Jp421Q7Mc/',
        'https://www.bilibili.com/video/BV1Jp421Q7Mc/?vd_source=3e93d5eadf397f04c406062f35fd8a38',
        'https://www.bilibili.com/video/BV1Jp421Q7Mc?vd_source=3e93d5eadf397f04c406062f35fd8a38',
        'https://www.youtube.com/watch?v=abc123xyz',
        'https://www.bilibili.com/video/BV1gM6GYtEXr',
        'https://www.bilibili.com/video/BV1gM6GYtEXr/'
      ];

      const usedUrls = [...new Set([...bannedUrlsForTopic, ...hardcodedBannedUrls])];
      const usedTitles = history.map(h => h.video_title).filter(Boolean);

      const sourceName = {
        'youtube': 'YouTube',
        'bilibili': 'Bilibili',
        'wechat': '微信视频号 (WeChat Channels)'
      }[source] || 'Bilibili';

      const difficultyGuide = {
        'beginner': 'Beginner level: Simple vocabulary, slow to normal speaking speed, clear pronunciation, basic sentence structures',
        'intermediate': 'Intermediate level: Everyday vocabulary, normal speaking speed, natural conversation pace, some idiomatic expressions',
        'advanced': 'Advanced level: Rich vocabulary, natural to fast speaking speed, complex sentences, idioms and colloquialisms'
      }[difficulty] || 'Intermediate level';

      // Step 1: 搜索视频
      setProcessingStep(0);
      const searchResult = await base44.integrations.Core.InvokeLLM({
        prompt: `CRITICAL REQUIREMENTS - READ CAREFULLY:

Topic: "${topic}"
Platform: ${sourceName}
Difficulty Level: ${difficultyGuide}

ABSOLUTELY FORBIDDEN URLs - DO NOT USE ANY OF THESE:
${usedUrls.length > 0 ? usedUrls.map((url, i) => `${i + 1}. ${url}`).join('\n') : 'None'}

FORBIDDEN Titles:
${usedTitles.length > 0 ? usedTitles.map((title, i) => `${i + 1}. ${title}`).join('\n') : 'None'}

YOUR TASK:
1. MUST use internet search to find REAL, EXISTING ${sourceName} videos about "${topic}"
2. The video MUST be a real video that exists and can be accessed
3. For YouTube: Use https://www.youtube.com/watch?v=[REAL_VIDEO_ID] - VIDEO_ID must be from an actual video you found
4. For Bilibili: Use https://www.bilibili.com/video/[REAL_BV_CODE] - BV code must be from an actual video you found
5. For WeChat Channels: Search for real WeChat video channel content
6. Requirements: Full English dialogue, 2+ speakers, 50-180 seconds duration, matching the difficulty level
7. Create a realistic English dialogue transcript (80-100 words) matching the topic and difficulty level

DIFFICULTY REQUIREMENTS:
${difficultyGuide}
- Adjust vocabulary complexity and speaking speed accordingly
- Ensure the content is appropriate for learners at this level

CRITICAL - VERIFY VIDEO EXISTS:
- You MUST actually search for and find a real video
- Copy the exact URL from your search results
- Do NOT generate random BV codes or video IDs
- Do NOT use any URLs from the forbidden list above
- Set found=true ONLY if you found a real, accessible video
- Set found=false if no suitable video exists

Return the result with a "found" field indicating if you successfully found a real video.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            found: { type: "boolean", description: "Whether a real video was found" },
            video_url: { type: "string", description: "Video URL (empty if not found)" },
            video_title: { type: "string", description: "Video title (empty if not found)" },
            transcript: { type: "string", description: "Full dialogue transcript" },
            message: { type: "string", description: "Error message if not found" }
          },
          required: ["found", "transcript"]
        }
      });

      // 检查是否找到视频
      if (!searchResult.found) {
        toast.error(searchResult.message || '未找到符合条件的视频，请尝试其他主题或平台');
        setIsProcessing(false);
        return;
      }

      // Step 2: 拆分内容
      setProcessingStep(1);
      await new Promise(r => setTimeout(r, 500));

      setProcessingStep(2);
      const splitResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Split this English dialogue into EXACTLY 5 equal parts for a 5-day reading plan.

      Difficulty Level: ${difficultyGuide}
      Original Dialogue (in English):
      ${searchResult.transcript}

      CRITICAL REQUIREMENTS:
      1. Keep ALL text in ENGLISH - DO NOT translate to Chinese or any other language
      2. Split into EXACTLY 5 parts - EVERY day MUST have dialogue content (NO EMPTY DAYS!)
      3. Each day should be roughly EQUAL in length (similar word count)
      4. Each day's content should be readable in 10-17 seconds at normal speaking speed
      5. This means each day should contain approximately 25-40 words (depending on difficulty level)
      6. Do not cut sentences in the middle - complete sentences only
      7. Include speaker labels (A:, B:, etc.)
      8. If the dialogue is too short, extend it slightly to ensure all 5 days have content
      9. If the dialogue is too long, trim the END to fit the 10-17 second per day constraint
      10. VERIFY: day1, day2, day3, day4, AND day5 ALL have content - NO EXCEPTIONS!

      Distribute the dialogue evenly across all 5 days with each day containing 25-40 words.`,
        response_json_schema: {
          type: "object",
          properties: {
            day1: { type: "string" },
            day2: { type: "string" },
            day3: { type: "string" },
            day4: { type: "string" },
            day5: { type: "string" }
          },
          required: ["day1", "day2", "day3", "day4", "day5"]
        }
      });

      // Step 3: 生成开场白
      setProcessingStep(3);
      const introResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Create short English introductions (max 3 sentences each) for each day's reading content.

      Topic: ${topic}
      Difficulty Level: ${difficultyGuide}

      Day 1 content: ${splitResult.day1}
      Day 2 content: ${splitResult.day2}
      Day 3 content: ${splitResult.day3}
      Day 4 content: ${splitResult.day4}
      Day 5 content: ${splitResult.day5}

      For each day, write a brief, engaging English introduction that:
      1. Sets the context for that day's dialogue
      2. Is encouraging and motivating
      3. Keep it VERY SHORT - about 1/3 the length of the dialogue content
      4. Uses vocabulary appropriate for ${difficulty} level learners
      5. Each intro should be roughly 15-25 words maximum`,
        response_json_schema: {
          type: "object",
          properties: {
            intro1: { type: "string" },
            intro2: { type: "string" },
            intro3: { type: "string" },
            intro4: { type: "string" },
            intro5: { type: "string" }
          },
          required: ["intro1", "intro2", "intro3", "intro4", "intro5"]
        }
      });

      // Step 4: 生成AI解释
      setProcessingStep(4);
      const explanationResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this English dialogue and provide detailed learning explanations.

      Topic: ${topic}
      Difficulty Level: ${difficultyGuide}
      Full Dialogue: ${searchResult.transcript}

      Provide:
      1. Topic Explanation: Brief overview of the topic and its real-world applications (2-3 sentences)
      2. Pronunciation Tips: Key pronunciation points, stress patterns, and common mistakes to avoid (3-4 tips)
      3. Grammar Points: Important grammar structures used in the dialogue with examples (3-4 points)
      4. Vocabulary Notes: Advanced or important vocabulary words with definitions and usage examples (5-6 words)

      Keep explanations clear and appropriate for ${difficulty} level learners.`,
        response_json_schema: {
          type: "object",
          properties: {
            topic_explanation: { type: "string" },
            pronunciation_tips: { type: "string" },
            grammar_points: { type: "string" },
            vocabulary_notes: { type: "string" }
          },
          required: ["topic_explanation", "pronunciation_tips", "grammar_points", "vocabulary_notes"]
        }
      });

      // 保存结果
      const finalResult = {
        topic,
        source,
        difficulty,
        video_url: searchResult.video_url,
        video_title: searchResult.video_title,
        full_transcript: searchResult.transcript,
        topic_explanation: explanationResult.topic_explanation,
        pronunciation_tips: explanationResult.pronunciation_tips,
        grammar_points: explanationResult.grammar_points,
        vocabulary_notes: explanationResult.vocabulary_notes,
        day1_content: splitResult.day1,
        day1_intro: introResult.intro1,
        day2_content: splitResult.day2,
        day2_intro: introResult.intro2,
        day3_content: splitResult.day3,
        day3_intro: introResult.intro3,
        day4_content: splitResult.day4,
        day4_intro: introResult.intro4,
        day5_content: splitResult.day5,
        day5_intro: introResult.intro5,
        status: 'completed'
      };

      await base44.entities.VideoRecord.create(finalResult);
      setResult(finalResult);
      toast.success('内容生成完成！');

    } catch (error) {
      console.error('Processing error:', error);
      toast.error('处理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setProcessingStep(0);
  };

  const handleResearch = () => {
    if (result) {
      processVideo(result.topic, result.source || 'bilibili', result.difficulty || 'intermediate');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="pt-12 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center gap-3 mb-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              英语晨读视频助手
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 max-w-lg mx-auto"
          >
            输入主题，自动获取英语对话视频并拆分成五天的晨读内容
          </motion.p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-12">
        <AnimatePresence mode="wait">
          {!isProcessing && !result && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TopicInput onSubmit={processVideo} isLoading={isProcessing} />
            </motion.div>
          )}

          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProcessingAnimation step={processingStep} />
            </motion.div>
          )}

          {result && !isProcessing && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ResultDisplay result={result} onReset={handleReset} onResearch={handleResearch} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}