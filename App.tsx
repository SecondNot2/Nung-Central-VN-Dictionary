import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dictionary from './pages/Dictionary';
import ChatBot from './pages/ChatBot';
import ImageAnalyzer from './pages/ImageAnalyzer';
import Contribute from './pages/Contribute';
import { AppRoute } from './types';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.DICTIONARY);

  const renderContent = () => {
    switch (currentRoute) {
      case AppRoute.DICTIONARY:
        return <Dictionary />;
      case AppRoute.CHAT:
        return <ChatBot />;
      case AppRoute.IMAGE_ANALYSIS:
        return <ImageAnalyzer />;
      case AppRoute.CONTRIBUTE:
        return <Contribute />;
      default:
        return <Dictionary />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-earth-50 font-sans text-earth-900">
      <Navigation currentRoute={currentRoute} setRoute={setCurrentRoute} />
      
      <main className="flex-grow">
        {renderContent()}
      </main>

      <footer className="bg-earth-900 text-earth-300 py-6 text-center text-sm">
        <p>© {new Date().getFullYear()} Dự án Từ điển Nùng & Miền Trung Việt Nam.</p>
        <p className="mt-1 text-earth-400">Gìn giữ Ngôn ngữ & Văn hóa.</p>
      </footer>
    </div>
  );
};

export default App;