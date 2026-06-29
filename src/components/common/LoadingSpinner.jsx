import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-48 sm:h-64">
      <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-600"></div>
    </div>
  );
};

export default LoadingSpinner;