import React, { useState } from 'react';
import { resultsAPI } from '../../api/results';
import Alert from '../../components/common/Alert';
import { FiShield, FiCheckCircle, FiXCircle, FiSearch, FiClock, FiHash } from 'react-icons/fi';

const VerifyResult = () => {
  const [matricNo, setMatricNo] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!matricNo) {
      alert('Please enter matriculation number');
      return;
    }
    
    setVerifying(true);
    setVerificationResult(null);
    
    // Simulate blockchain verification
    setTimeout(() => {
      const isVerified = Math.random() > 0.3;
      setVerificationResult({
        verified: isVerified,
        message: isVerified 
          ? 'Result is authentic and verified on the blockchain' 
          : 'Result hash not found on blockchain. Possible tampering detected!',
        timestamp: new Date().toISOString(),
        blockNumber: isVerified ? Math.floor(Math.random() * 1000000) : null,
      });
      setVerifying(false);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <FiShield className="text-green-600 text-2xl sm:text-4xl" />
        </div>
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Verify Result Authenticity</h1>
        <p className="text-[10px] sm:text-sm text-gray-500 mt-1 sm:mt-2">
          Use blockchain technology to verify the authenticity of academic results
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-6">
        <form onSubmit={handleVerify} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">
              Matriculation Number
            </label>
            <input
              type="text"
              value={matricNo}
              onChange={(e) => setMatricNo(e.target.value.toUpperCase())}
              placeholder="e.g., U21/01/12345"
              className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none uppercase"
              required
            />
          </div>
          
          <div>
            <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">
              Semester <span className="text-gray-400">(Optional)</span>
            </label>
            <select
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">All Semesters</option>
              <option value="2025/2026_first">2025/2026 - First Semester</option>
              <option value="2025/2026_second">2025/2026 - Second Semester</option>
              <option value="2024/2025_first">2024/2025 - First Semester</option>
              <option value="2024/2025_second">2024/2025 - Second Semester</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={verifying}
            className="w-full py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {verifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <FiSearch size={14} className="sm:size-18" />
                <span>Verify Result</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result */}
      {verificationResult && (
        <div className={`bg-white rounded-xl shadow-sm border-l-4 p-3 sm:p-5 ${
          verificationResult.verified ? 'border-green-500' : 'border-red-500'
        }`}>
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="flex-shrink-0 mt-0.5">
              {verificationResult.verified ? (
                <FiCheckCircle className="text-green-500 text-lg sm:text-2xl" />
              ) : (
                <FiXCircle className="text-red-500 text-lg sm:text-2xl" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm sm:text-base font-semibold ${
                verificationResult.verified ? 'text-green-700' : 'text-red-700'
              }`}>
                {verificationResult.verified ? 'Verification Successful' : 'Verification Failed'}
              </h3>
              <p className="text-[10px] sm:text-sm text-gray-600 mt-1">{verificationResult.message}</p>
              
              {verificationResult.verified && (
                <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-[8px] sm:text-xs font-semibold text-gray-700 mb-1">Blockchain Details</p>
                  <div className="grid grid-cols-2 gap-1 text-[8px] sm:text-xs text-gray-600">
                    <div>
                      <span className="text-gray-400">Block Number</span>
                      <p className="font-mono font-medium text-gray-700">#{verificationResult.blockNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Timestamp</span>
                      <p className="font-medium text-gray-700">{new Date(verificationResult.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">Network</span>
                      <p className="font-medium text-gray-700">Ethereum (Ganache)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyResult;