import React from 'react';
import VideoSearch from './components/VideoSearch';
import './index.css';

function App() {
  return (
      <div className="App min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Morning English</h1>
                <p className="text-gray-600">英语学习平台</p>
              </div>
              <nav className="flex space-x-4">
                <a href="/" className="text-gray-700 hover:text-blue-600">首页</a>
                <a href="#search" className="text-gray-700 hover:text-blue-600">视频搜索</a>
                <a href="#downloads" className="text-gray-700 hover:text-blue-600">下载管理</a>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <VideoSearch />

          {/* 原有的其他内容可以放在这里 */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">英语学习资源</h2>
            {/* 原有的应用内容 */}
          </section>
        </main>

        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <p>© 2024 Morning English. All rights reserved.</p>
              <p className="text-gray-400 mt-2">微信视频号搜索功能仅供学习使用</p>
            </div>
          </div>
        </footer>
      </div>
  );
}

export default App;