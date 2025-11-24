import React from 'react';

const Header: React.FC = () => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="flex flex-col items-center border-b border-double border-gray-300 pb-2 mb-8">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center text-[10px] md:text-xs font-sans-ui uppercase tracking-wider text-gray-600 py-2 px-4 border-b border-gray-200">
        <div className="hidden md:block">Global Edition</div>
        <div className="flex-1 text-center md:text-right md:flex-none">{today}</div>
      </div>

      {/* Masthead */}
      <div className="py-6 md:py-8 text-center w-full">
        <h1 className="font-header text-4xl md:text-6xl lg:text-8xl tracking-tight text-black leading-none">
          The Insight Times
        </h1>
      </div>

      {/* Tagline Bar */}
      <div className="w-full flex justify-center items-center py-2 border-t border-gray-300">
        <p className="italic font-header text-sm md:text-lg text-gray-700">
          "All the Intelligence That's Fit to Print"
        </p>
      </div>
    </header>
  );
};

export default Header;