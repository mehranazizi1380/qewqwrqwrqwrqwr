
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { referralService } from '../../services/referralService';
import { tonWalletService } from '../../services/tonService';

interface Prize {
  id: number;
  value: string;
  icon: string;
  rarity: 'common' | 'rare' | 'legendary';
  color: string;
}

const prizes: Prize[] = [
  { id: 1, value: '0.5 TON', icon: 'ri-money-dollar-circle-line', rarity: 'common', color: '#3B82F6' },
  { id: 2, value: '10 USDT', icon: 'ri-coin-line', rarity: 'common', color: '#10B981' },
  { id: 3, value: '30 USDT', icon: 'ri-coin-line', rarity: 'common', color: '#10B981' },
  { id: 4, value: '5 TON', icon: 'ri-money-dollar-circle-line', rarity: 'rare', color: '#8B5CF6' },
  { id: 5, value: '100 USDT', icon: 'ri-coin-line', rarity: 'rare', color: '#8B5CF6' },
  { id: 6, value: '333 TON', icon: 'ri-money-dollar-circle-line', rarity: 'legendary', color: '#F59E0B' },
  { id: 7, value: '2222 DOGS', icon: 'ri-heart-line', rarity: 'rare', color: '#8B5CF6' },
  { id: 8, value: '20 REDO', icon: 'ri-refresh-line', rarity: 'common', color: '#3B82F6' },
  { id: 9, value: '1500 USDT', icon: 'ri-coin-line', rarity: 'legendary', color: '#F59E0B' },
  { id: 10, value: '456 NOT', icon: 'ri-close-circle-line', rarity: 'common', color: '#3B82F6' },
  { id: 11, value: '500 USDT', icon: 'ri-coin-line', rarity: 'rare', color: '#8B5CF6' },
  { id: 12, value: '0.1 TON', icon: 'ri-money-dollar-circle-line', rarity: 'common', color: '#3B82F6' },
  { id: 13, value: '5000 USDT', icon: 'ri-coin-line', rarity: 'legendary', color: '#F59E0B' },
  { id: 14, value: '10000 USDT', icon: 'ri-coin-line', rarity: 'legendary', color: '#F59E0B' },
  { id: 15, value: '400 TON', icon: 'ri-money-dollar-circle-line', rarity: 'legendary', color: '#F59E0B' }
];

// Duplicate prizes to make 30 segments
const wheelPrizes = [...prizes, ...prizes];

// Sound effects
const playSpinSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.5);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

const playWinSound = (rarity: string) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  if (rarity === 'legendary') {
    // Epic win sound
    oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.4);
    oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.6);
  } else if (rarity === 'rare') {
    // Big win sound
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(554, audioContext.currentTime + 0.3);
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.6);
  } else {
    // Normal win sound
    oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.3);
  }
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 1);
};

export default function WheelOfFortune() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinsLeft, setSpinsLeft] = useState(1);
  const [showWinModal, setShowWinModal] = useState(false);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [recentWinners, setRecentWinners] = useState([
    { address: '0x7a2f...8b3c', prize: '500 USDT', time: '2 min ago', color: 'text-green-300' },
    { address: '0x9d4e...2f1a', prize: '333 TON', time: '3 min ago', color: 'text-yellow-300' },
    { address: '0x5c8b...7e9d', prize: '10 USDT', time: '5 min ago', color: 'text-blue-300' },
    { address: '0x3f6a...4c8e', prize: '2222 DOGS', time: '7 min ago', color: 'text-purple-300' },
    { address: '0x8e2d...9f5b', prize: '100 USDT', time: '9 min ago', color: 'text-green-300' }
  ]);
  const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load referral bonus spins
    if (userFriendlyAddress) {
      const referralData = referralService.getReferralData(userFriendlyAddress);
      if (referralData) {
        setSpinsLeft(prev => prev + referralData.bonusSpins);
      }
    }
  }, [userFriendlyAddress]);

  // Add wallet to service when connected
  useEffect(() => {
    if (userFriendlyAddress && tonConnectUI.connected) {
      tonWalletService.addConnectedWallet(userFriendlyAddress);
    }
  }, [userFriendlyAddress, tonConnectUI.connected]);

  // Update recent winners every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const prizes = ['500 USDT', '333 TON', '10 USDT', '2222 DOGS', '100 USDT', '5000 USDT', '20 REDO', '1500 USDT'];
      const colors = ['text-green-300', 'text-yellow-300', 'text-blue-300', 'text-purple-300'];
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomAddress = `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`;
      
      const newWinner = {
        address: randomAddress,
        prize: randomPrize,
        time: 'Just now',
        color: randomColor
      };

      setRecentWinners(prev => [newWinner, ...prev.slice(0, 4)]);
    }, 30000); // هر 30 ثانیه

    return () => clearInterval(interval);
  }, []);

  const spinWheel = () => {
    if (isSpinning || spinsLeft <= 0) return;

    setIsSpinning(true);
    setSpinsLeft(prev => prev - 1);

    // Play spin sound
    try {
      playSpinSound();
    } catch (error) {
      console.log('Audio not supported');
    }

    // Calculate random rotation (at least 7 full rotations)
    const minRotation = 7 * 360;
    const randomRotation = Math.random() * 360;
    const totalRotation = rotation + minRotation + randomRotation;
    
    setRotation(totalRotation);

    // Determine winning prize
    const normalizedRotation = (360 - (totalRotation % 360)) % 360;
    const segmentAngle = 360 / wheelPrizes.length;
    const winningIndex = Math.floor(normalizedRotation / segmentAngle);
    const prize = wheelPrizes[winningIndex];

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(prize);
      setShowWinModal(true);
      
      // Play win sound based on rarity
      try {
        playWinSound(prize.rarity);
      } catch (error) {
        console.log('Audio not supported');
      }
    }, 4000);
  };

  const claimPrize = () => {
    if (!tonConnectUI.connected) {
      tonConnectUI.openModal();
    } else {
      alert('Your reward request has been submitted!');
      setShowWinModal(false);
    }
  };

  const getWinModalStyle = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400/20 to-orange-500/20 border-yellow-400/50';
      case 'rare':
        return 'from-purple-400/20 to-pink-500/20 border-purple-400/50';
      default:
        return 'from-blue-400/20 to-cyan-500/20 border-blue-400/50';
    }
  };

  const getWinTitle = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'MEGA WIN!';
      case 'rare':
        return 'BIG WIN!';
      default:
        return 'YOU WON!';
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
            Wheel of Fortune
          </h2>
          <p className="text-gray-400 text-lg mb-6">
            Spin the wheel and win amazing rewards on TON blockchain!
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
            <div>Spins Left: <span className="text-white font-bold">{spinsLeft}</span></div>
            <div>•</div>
            <div>Free Spin Every 7 Days</div>
            <div>•</div>
            <div>1 Spin Per Referral</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          {/* Wheel */}
          <div className="relative flex items-center justify-center">
            {/* Casino Lights - Fixed positioning */}
            <div className="absolute inset-0 w-[500px] h-[500px] rounded-full pointer-events-none">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-4 h-4 bg-yellow-400 rounded-full animate-pulse shadow-lg"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 15}deg) translateY(-240px) translateX(-50%)`,
                    transformOrigin: '50% 240px',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative w-96 h-96 z-10">
              {/* Wheel Container */}
              <div
                ref={wheelRef}
                className="w-full h-full rounded-full border-8 border-yellow-400 shadow-2xl relative overflow-hidden"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
                  boxShadow: '0 0 50px rgba(251, 191, 36, 0.5)',
                }}
              >
                {wheelPrizes.map((prize, index) => {
                  const angle = (360 / wheelPrizes.length) * index;
                  const nextAngle = (360 / wheelPrizes.length) * (index + 1);
                  
                  return (
                    <div
                      key={`${prize.id}-${index}`}
                      className="absolute w-full h-full"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((nextAngle - angle) * Math.PI / 180)}% ${50 - 50 * Math.sin((nextAngle - angle) * Math.PI / 180)}%)`
                      }}
                    >
                      <div 
                        className="w-full h-full flex items-start justify-center pt-4"
                        style={{ 
                          backgroundColor: prize.color + '40',
                          background: `linear-gradient(to bottom, ${prize.color}60, ${prize.color}20)`
                        }}
                      >
                        <div 
                          className="text-center text-white"
                          style={{ transform: `rotate(${(nextAngle - angle) / 2}deg)` }}
                        >
                          <i className={`${prize.icon} text-lg mb-1 block drop-shadow-lg`}></i>
                          <div className={`text-xs font-bold drop-shadow-lg ${
                            prize.rarity === 'legendary' ? 'text-yellow-300' : 
                            prize.rarity === 'rare' ? 'text-purple-300' : 'text-white'
                          }`}>
                            {prize.value}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Center Hub */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-20">
                <i className="ri-star-fill text-white text-xl animate-pulse"></i>
              </div>

              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg"></div>
              </div>
            </div>

            {/* Spin Button - Positioned lower for mobile */}
            <div className="absolute bottom-[-100px] sm:bottom-[-80px] left-1/2 transform -translate-x-1/2">
              <button
                onClick={spinWheel}
                disabled={isSpinning || spinsLeft <= 0}
                className={`px-12 py-4 text-xl font-bold rounded-full transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  spinsLeft > 0 && !isSpinning
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSpinning ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    SPINNING...
                  </>
                ) : spinsLeft > 0 ? (
                  'SPIN'
                ) : (
                  'NO SPINS LEFT'
                )}
              </button>
            </div>
          </div>

          {/* Terminal & Claim Section */}
          <div className="w-full lg:w-96 space-y-6 mt-16 lg:mt-0">
            {/* Claim Button - Positioned lower for mobile */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                <i className="ri-gift-line mr-2 text-yellow-400"></i>
                Claim Rewards
              </h3>
              <button
                onClick={claimPrize}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-gift-line mr-2"></i>
                CLAIM ALL REWARDS
              </button>
            </div>

            {/* Recent Winners Terminal */}
            <div className="bg-black/80 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
              <h3 className="text-green-400 font-bold mb-4 font-mono flex items-center">
                <i className="ri-terminal-line mr-2"></i>
                RECENT WINNERS
                <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </h3>
              <div className="space-y-2 text-sm font-mono max-h-64 overflow-y-auto">
                {recentWinners.map((winner, index) => (
                  <div key={index} className={winner.color}>
                    <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {winner.address} won {winner.prize}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-500 font-mono">
                <i className="ri-live-line mr-1 text-green-400"></i>
                Live Updates • Updates every 30 seconds
              </div>
            </div>
          </div>
        </div>

        {/* Win Modal */}
        <AnimatePresence>
          {showWinModal && wonPrize && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className={`bg-gradient-to-br ${getWinModalStyle(wonPrize.rarity)} backdrop-blur-sm border-2 rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden`}
              >
                {/* Confetti Effect */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: -100, x: Math.random() * 400, opacity: 1 }}
                      animate={{ y: 500, opacity: 0 }}
                      transition={{ duration: 3, delay: Math.random() * 2 }}
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    />
                  ))}
                </div>

                <div className="relative z-10">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                    className="text-6xl mb-4"
                  >
                    🎉
                  </motion.div>
                  
                  <h2 className={`text-3xl font-bold mb-4 ${wonPrize.rarity === 'legendary' ? 'text-yellow-300' : wonPrize.rarity === 'rare' ? 'text-purple-300' : 'text-blue-300'}`}>
                    {getWinTitle(wonPrize.rarity)}
                  </h2>
                  
                  <div className="bg-black/30 rounded-xl p-6 mb-6">
                    <i className={`${wonPrize.icon} text-4xl text-white mb-2 block`}></i>
                    <div className="text-2xl font-bold text-white">
                      {wonPrize.value}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6">
                    Congratulations! You have won an amazing reward!
                  </p>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowWinModal(false)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 whitespace-nowrap cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={claimPrize}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 whitespace-nowrap cursor-pointer"
                    >
                      Claim
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
