import React from 'react';

const TailwindTest = () => {
  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white font-bold text-xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tailwind CSS is Working!</h2>
        <p className="text-gray-600 text-sm">All Tailwind CSS classes are properly configured and functioning.</p>
      </div>
      
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h3 className="text-green-800 font-semibold text-sm">✅ Configuration Complete</h3>
          <p className="text-green-600 text-xs mt-1">tailwind.config.js and postcss.config.js are properly set up</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h3 className="text-blue-800 font-semibold text-sm">🎨 Custom Theme</h3>
          <p className="text-blue-600 text-xs mt-1">Custom colors, fonts, and animations are available</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <h3 className="text-purple-800 font-semibold text-sm">📱 Responsive Design</h3>
          <p className="text-purple-600 text-xs mt-1">Mobile-first responsive utilities are ready to use</p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-200">
          Primary Button
        </button>
        <button className="flex-1 bg-secondary-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-secondary-600 transition-colors duration-200">
          Secondary Button
        </button>
      </div>
      
      <div className="text-center">
        <p className="text-xs text-gray-500">You can now use all Tailwind CSS classes in your components!</p>
      </div>
    </div>
  );
};

export default TailwindTest;