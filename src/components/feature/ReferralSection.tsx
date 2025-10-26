
import { useState, useEffect } from 'react';
import { useTonAddress } from '@tonconnect/ui-react';
import { referralService, ReferralData } from '../../services/referralService';

export default function ReferralSection() {
  const userFriendlyAddress = useTonAddress();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (userFriendlyAddress) {
      const data = referralService.getReferralData(userFriendlyAddress);
      setReferralData(data);
    }
  }, [userFriendlyAddress]);

  useEffect(() => {
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode && userFriendlyAddress) {
      referralService.processReferral(refCode, userFriendlyAddress);
    }
  }, [userFriendlyAddress]);

  const generateReferralLink = () => {
    if (!userFriendlyAddress) return;
    
    const link = referralService.getReferralLink(userFriendlyAddress);
    const data = referralService.getReferralData(userFriendlyAddress);
    setReferralData(data);
    setShowReferralModal(true);
  };

  const copyReferralLink = async () => {
    if (!userFriendlyAddress) return;
    
    const link = referralService.getReferralLink(userFriendlyAddress);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
            <i className="ri-user-add-line mr-4"></i>
            Invite Friends & Earn
          </h2>
          <p className="text-gray-400 text-lg">
            Get 1 FREE spin for every friend you invite!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Referral Stats */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">
              <i className="ri-trophy-line mr-2 text-yellow-400"></i>
              Your Referral Stats
            </h3>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {referralData?.totalReferrals || 0}
                </div>
                <div className="text-gray-400 text-sm">Total Invites</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {referralData?.bonusSpins || 0}
                </div>
                <div className="text-gray-400 text-sm">Bonus Spins</div>
              </div>
            </div>

            <button
              onClick={generateReferralLink}
              disabled={!userFriendlyAddress}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 whitespace-nowrap cursor-pointer ${
                userFriendlyAddress
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <i className="ri-share-line mr-2"></i>
              {userFriendlyAddress ? 'Generate Invite Link' : 'Connect Wallet First'}
            </button>
          </div>

          {/* How it Works */}
          <div className="space-y-6">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="text-xl font-bold text-white">Share Your Link</h4>
              </div>
              <p className="text-gray-400">
                Generate your unique referral link and share it with friends
              </p>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="text-xl font-bold text-white">Friends Join</h4>
              </div>
              <p className="text-gray-400">
                When friends connect their wallet using your link
              </p>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="text-xl font-bold text-white">Earn Spins</h4>
              </div>
              <p className="text-gray-400">
                Get 1 FREE spin for each successful referral
              </p>
            </div>
          </div>
        </div>

        {/* Referral Modal */}
        {showReferralModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  <i className="ri-gift-line mr-2 text-yellow-400"></i>
                  Your Referral Link
                </h3>
                <p className="text-gray-400">Share this link with your friends</p>
              </div>

              <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-300 truncate mr-4">
                    {userFriendlyAddress && referralService.getReferralLink(userFriendlyAddress)}
                  </div>
                  <button
                    onClick={copyReferralLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <i className={`ri-${copied ? 'check' : 'file-copy'}-line mr-1`}></i>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowReferralModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={copyReferralLink}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-share-line mr-2"></i>
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
