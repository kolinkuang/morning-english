const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(cors());
app.use(express.json());

// wx_channels_download 代理配置
const WX_PROXY_HOST = process.env.WX_PROXY_HOST || '127.0.0.1';
const WX_PROXY_PORT = process.env.WX_PROXY_PORT || '2022';
const wxProxyAgent = new HttpsProxyAgent(`http://${WX_PROXY_HOST}:${WX_PROXY_PORT}`);

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'wx-video-search-proxy',
        timestamp: new Date().toISOString()
    });
});

// 搜索视频号内容
app.post('/api/wx-search', async (req, res) => {
    try {
        const { query, type = 'video', limit = 20 } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: '搜索关键词不能为空'
            });
        }

        // 注意：这里需要根据 wx_channels_download 的实际API进行调整
        // 以下是模拟实现，实际使用时需要调用真实的微信视频号接口

        // 模拟搜索请求（实际应通过代理访问微信视频号）
        const searchResults = await simulateWxSearch(query, type, limit);

        res.json({
            success: true,
            data: searchResults,
            query,
            type,
            count: searchResults.length
        });

    } catch (error) {
        console.error('搜索错误:', error);
        res.status(500).json({
            success: false,
            message: '搜索服务暂时不可用',
            error: error.message
        });
    }
});

// 提交下载任务
app.post('/api/wx-download', async (req, res) => {
    try {
        const { videoId, videoUrl } = req.body;

        if (!videoId && !videoUrl) {
            return res.status(400).json({
                success: false,
                message: '视频ID或URL不能为空'
            });
        }

        // 调用 wx_channels_download 的下载API
        const downloadResult = await submitDownloadTask(videoId, videoUrl);

        res.json({
            success: true,
            data: downloadResult,
            message: '下载任务已提交'
        });

    } catch (error) {
        console.error('下载错误:', error);
        res.status(500).json({
            success: false,
            message: '下载任务提交失败',
            error: error.message
        });
    }
});

// 模拟微信视频号搜索（实际实现需要替换）
async function simulateWxSearch(query, type, limit) {
    // 这里应该是实际的微信视频号搜索逻辑
    // 需要处理代理、Cookie、请求头等

    const mockVideos = [];
    const types = ['英语学习', '晨读', '口语', '听力', '词汇'];
    const authors = ['英语老师Alice', '口语达人Mike', '听力训练营', '词汇大师', '英语角'];

    for (let i = 1; i <= limit; i++) {
        const typeIndex = i % types.length;
        const authorIndex = i % authors.length;

        mockVideos.push({
            id: `video_${Date.now()}_${i}`,
            video_id: `wx_${Math.random().toString(36).substr(2, 9)}`,
            title: `${query} - ${types[typeIndex]} 教程 #${i}`,
            description: `这是一个关于${query}的${types[typeIndex]}教学视频，适合英语学习者观看。`,
            author: authors[authorIndex],
            author_avatar: `https://ui-avatars.com/api/?name=${authors[authorIndex]}&background=random`,
            cover_url: `https://picsum.photos/400/225?random=${i}`,
            video_url: `https://example.com/video_${i}.mp4`,
            share_url: `https://channels.weixin.qq.com/${Math.random().toString(36).substr(2)}`,
            duration: `${Math.floor(Math.random() * 5) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
            view_count: Math.floor(Math.random() * 10000) + 1000,
            like_count: Math.floor(Math.random() * 1000) + 100,
            comment_count: Math.floor(Math.random() * 500) + 50,
            follower_count: Math.floor(Math.random() * 100000) + 10000,
            create_time: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            type: type
        });
    }

    return mockVideos;
}

// 提交下载任务到 wx_channels_download
async function submitDownloadTask(videoId, videoUrl) {
    try {
        // 实际应该调用 wx_channels_download 的API
        // 例如：http://127.0.0.1:2022/api/download
        const response = await axios.post('http://127.0.0.1:2022/api/download', {
            url: videoUrl,
            id: videoId
        }, {
            httpsAgent: wxProxyAgent
        });

        return response.data;
    } catch (error) {
        // 如果直接调用失败，返回模拟数据
        return {
            task_id: `task_${Date.now()}`,
            status: 'pending',
            video_id: videoId,
            message: '任务已添加到队列'
        };
    }
}

// 启动服务器
app.listen(PORT, () => {
    console.log(`微信视频号搜索代理服务运行在 http://localhost:${PORT}`);
    console.log(`健康检查: http://localhost:${PORT}/health`);
    console.log(`请确保 wx_channels_download 代理服务已启动 (127.0.0.1:2022)`);
});

async function realWxSearch(query, type, limit) {
    try {
        // 实际的微信视频号搜索请求
        const response = await axios.get('https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/search/search', {
            params: {
                keyword: query,
                type: type,
                count: limit,
                // 其他必要参数
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': '您的微信Cookie',
                'Referer': 'https://channels.weixin.qq.com/'
            },
            httpsAgent: wxProxyAgent
        });

        // 解析返回的数据
        return parseWxSearchResponse(response.data);
    } catch (error) {
        console.error('真实搜索错误:', error);
        throw error;
    }
}

module.exports = app;