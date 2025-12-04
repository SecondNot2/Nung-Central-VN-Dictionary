import React from 'react';
import { AppRoute } from '../types';

interface NavigationProps {
  currentRoute: AppRoute;
  setRoute: (route: AppRoute) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentRoute, setRoute }) => {
  const navItems = [
    { id: AppRoute.DICTIONARY, label: 'Từ điển', icon: 'fa-book' },
    { id: AppRoute.IMAGE_ANALYSIS, label: 'Phân tích ảnh', icon: 'fa-camera' },
    { id: AppRoute.CHAT, label: 'Trò chuyện AI', icon: 'fa-comments' },
    { id: AppRoute.CONTRIBUTE, label: 'Đóng góp', icon: 'fa-hand-holding-heart' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-earth-900 text-earth-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setRoute(AppRoute.DICTIONARY)}>
            <div className="bg-bamboo-600 p-2 rounded-full">
               <i className="fa-solid fa-language text-white"></i>
            </div>
            <span className="font-serif font-bold text-xl tracking-wide">NungDic</span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setRoute(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    currentRoute === item.id
                      ? 'bg-earth-700 text-white'
                      : 'text-earth-200 hover:bg-earth-800 hover:text-white'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} mr-2`}></i>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="md:hidden flex space-x-4">
             {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setRoute(item.id)}
                  className={`p-2 rounded-md ${currentRoute === item.id ? 'text-bamboo-500' : 'text-earth-200'}`}
                >
                  <i className={`fa-solid ${item.icon}`}></i>
                </button>
              ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;