import React, { useState } from 'react';
import axios from 'axios';

const VideoSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchType, setSearchType] = useState('video'); // video, user, live

    // 搜索类型选项
    const searchTypes = [
        { value: 'video', label: '视频' },
        { value: 'user', label: '用户' },
        { value: 'live', label: '直播' }
    ];

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) {
            setError('请输入搜索关键词');
            return;
        }

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            // 调用后端搜索API
            const response = await axios.post('/api/wx-search', {
                query: query.trim(),
                type: searchType,
                limit: 20
            });

            if (response.data.success) {
                setResults(response.data.data || []);
            } else {
                setError(response.data.message || '搜索失败');
            }
        } catch (err) {
            console.error('搜索错误:', err);
            setError('搜索服务暂时不可用，请检查后端服务是否运行');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (videoId, videoUrl) => {
        try {
            const response = await axios.post('/api/wx-download', {
                videoId,
                videoUrl
            });

            if (response.data.success) {
                alert('下载任务已提交，请查看下载状态');
            } else {
                alert(response.data.message || '下载失败');
            }
        } catch (err) {
            console.error('下载错误:', err);
            alert('下载失败');
        }
    };

    return (
        <div className="video-search-container p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">微信视频号搜索</h2>
                <p className="text-gray-600">搜索微信视频号内容并下载</p>
            </div>

            {/* 搜索表单 */}
            <form onSubmit={handleSearch} className="mb-8 bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="输入关键词搜索视频号内容..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="w-full md:w-48">
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {searchTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                搜索中...
              </span>
                        ) : '搜索'}
                    </button>
                </div>

                <div className="text-sm text-gray-500">
                    提示：搜索功能需要后端服务支持，请确保已启动代理服务
                </div>
            </form>

            {/* 错误提示 */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-700">{error}</span>
                    </div>
                </div>
            )}

            {/* 搜索结果 */}
            <div className="results-section">
                {results.length > 0 && (
                    <div className="mb-4 flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800">
                            搜索结果 ({results.length} 个)
                        </h3>
                        <div className="text-sm text-gray-500">
                            点击"下载"按钮将视频添加到下载队列
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((item, index) => (
                        <div key={index} className="video-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            {/* 封面图片 */}
                            <div className="aspect-video bg-gray-100 relative">
                                {item.cover_url ? (
                                    <img
                                        src={item.cover_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBDb3ZlcjwvdGV4dD48L3N2Zz4=';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        暂无封面
                                    </div>
                                )}

                                {/* 视频时长 */}
                                {item.duration && (
                                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                        {item.duration}
                                    </div>
                                )}
                            </div>

                            {/* 视频信息 */}
                            <div className="p-4">
                                <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                                    {item.title || '无标题'}
                                </h4>

                                <div className="flex items-center mb-3">
                                    {item.author_avatar && (
                                        <img
                                            src={item.author_avatar}
                                            alt={item.author}
                                            className="w-8 h-8 rounded-full mr-2"
                                        />
                                    )}
                                    <div>
                                        <div className="font-medium text-sm text-gray-700">
                                            {item.author || '未知作者'}
                                        </div>
                                        {item.follower_count && (
                                            <div className="text-xs text-gray-500">
                                                {item.follower_count} 粉丝
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 视频统计信息 */}
                                <div className="flex justify-between text-sm text-gray-600 mb-4">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                        {item.view_count || '0'} 观看
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                        </svg>
                                        {item.like_count || '0'} 点赞
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                        </svg>
                                        {item.comment_count || '0'} 评论
                                    </div>
                                </div>

                                {/* 操作按钮 */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => window.open(item.video_url || item.share_url, '_blank')}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                    >
                                        查看原视频
                                    </button>
                                    <button
                                        onClick={() => handleDownload(item.video_id || item.id, item.video_url)}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                    >
                                        下载视频
                                    </button>
                                </div>

                                {/* 发布时间 */}
                                {item.create_time && (
                                    <div className="mt-3 text-xs text-gray-500 text-center">
                                        发布于: {item.create_time}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 空状态 */}
                {results.length === 0 && !loading && query && !error && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-medium text-gray-700 mb-2">未找到相关视频</h4>
                        <p className="text-gray-500">请尝试其他关键词或搜索类型</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoSearch;