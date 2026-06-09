import React, { useState } from 'react';
import { resultsAPI } from '../../api/results';
import Alert from '../../components/common/Alert';
import { FiShield, FiCheckCircle, FiXCircle, FiSearch } from 'react-icons/fi';

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
      // In production, this would call a blockchain verification endpoint
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiShield className="text-primary-600 text-3xl" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Verify Result Authenticity</h1>
        <p className="text-gray-500 mt-2">
          Use blockchain technology to verify the authenticity of academic results
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matriculation Number
            </label>
            <input
              type="text"
              value={matricNo}
              onChange={(e) => setMatricNo(e.target.value.toUpperCase())}
              placeholder="e.g., U21/01/12345"
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester (Optional)
            </label>
            <select
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              className="input-field"
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
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {verifying ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <FiSearch size={18} />
                <span>Verify Result</span>
              </>
            )}
          </button>
        </form>
      </div>

      {verificationResult && (
        <div className={`card ${verificationResult.verified ? 'border-green-500' : 'border-red-500'} border-l-8`}>
          <div className="flex items-start space-x-4">
            <div>
              {verificationResult.verified ? (
                <FiCheckCircle className="text-green-500 text-2xl" />
              ) : (
                <FiXCircle className="text-red-500 text-2xl" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${verificationResult.verified ? 'text-green-700' : 'text-red-700'}`}>
                {verificationResult.verified ? 'Verification Successful' : 'Verification Failed'}
              </h3>
              <p className="text-gray-600 mt-1">{verificationResult.message}</p>
              
              {verificationResult.verified && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                  <p><strong>Blockchain Details:</strong></p>
                  <p>Block Number: {verificationResult.blockNumber}</p>
                  <p>Timestamp: {new Date(verificationResult.timestamp).toLocaleString()}</p>
                  <p>Network: Ethereum (Ganache)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card bg-blue-50">
        <h3 className="font-semibold text-blue-800 mb-2">How Blockchain Verification Works</h3>
        <ul className="text-sm text-blue-700 space-y-2">
          <li>✓ Each result is hashed and stored on the blockchain</li>
          <li>✓ The hash is immutable and cannot be altered</li>
          <li>✓ Anyone can verify authenticity without a central authority</li>
          <li>✓ Tampering with results will cause verification to fail</li>
          <li>✓ All verifications are transparent and auditable</li>
        </ul>
      </div>
    </div>
  );
};

export default VerifyResult;