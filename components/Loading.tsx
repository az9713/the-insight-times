import React from 'react';

interface LoadingProps {
  status: string;
}

const Loading: React.FC<LoadingProps> = ({ status }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse space-y-6">
      <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      <div className="text-center space-y-2">
        <h2 className="font-headline text-2xl text-gray-900 font-bold">Developing Story</h2>
        <p className="font-sans-ui text-gray-500 tracking-widest text-sm uppercase">{status}</p>
      </div>
    </div>
  );
};

export default Loading;