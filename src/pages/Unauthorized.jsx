import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 sm:p-8 text-center">
        {/* Header */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-red-500">!</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
          <p className="text-sm text-gray-500 mt-2">
            You don't have permission to access this page.
          </p>
        </div>

        {/* Action Button */}
        <Link
          to="/"
          className="inline-block w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition duration-200"
        >
          Go to Dashboard
        </Link>

        {/* Help Text */}
        <p className="mt-4 text-xs text-gray-400">
          If you believe this is a mistake, please contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;