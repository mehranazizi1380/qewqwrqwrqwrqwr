
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Button from '../base/Button';

export default function HeroSection() {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  const gradientBackgrounds = [
    'bg-gradient-to-br from-blue-900 via-purple-900 to-black',
    'bg-gradient-to-br from-purple-900 via-pink-900 to-black',
    'bg-gradient-to-br from-indigo-900 via-blue-900 to-black',
    'bg-gradient-to-br from-violet-900 via-purple-900 to-black'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => 
        (prevIndex + 1) % gradientBackgrounds.length
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-all duration-2000 ${gradientBackgrounds[currentBgIndex]}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/20 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-28 h-28 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-yellow-500/20 rounded-full blur-lg animate-bounce delay-500"></div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>
      
      {/* Background Indicators */}
      <div className="absolute bottom-20 right-8 flex space-x-2 z-20">
        {gradientBackgrounds.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBgIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentBgIndex 
                ? 'bg-yellow-400 shadow-lg' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="space-y-8"
        >
          {/* Main Title */}
          <div className="space-y-4">
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-white leading-tight"
              style={{ fontFamily: 'Orbitron, monospace' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                NFT GetGems
              </span>
            </motion.h1>
            
            <motion.h2 
              className="text-2xl md:text-4xl font-bold text-yellow-400"
              style={{ fontFamily: 'Orbitron, monospace' }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              & Wheel of Fortune 2025
            </motion.h2>
          </div>

          {/* Subtitle */}
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            The ultimate NFT marketplace on TON blockchain with exciting rewards. 
            Trade, collect, and win amazing prizes with our revolutionary wheel of fortune!
          </motion.p>

          {/* Features */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <i className="ri-nft-line text-4xl text-blue-400 mb-4 block"></i>
              <h3 className="text-lg font-bold text-white mb-2">Premium NFTs</h3>
              <p className="text-gray-300 text-sm">Discover exclusive digital collectibles on TON blockchain</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <i className="ri-trophy-line text-4xl text-yellow-400 mb-4 block"></i>
              <h3 className="text-lg font-bold text-white mb-2">Wheel of Fortune</h3>
              <p className="text-gray-300 text-sm">Spin daily for amazing rewards and prizes</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <i className="ri-secure-payment-line text-4xl text-green-400 mb-4 block"></i>
              <h3 className="text-lg font-bold text-white mb-2">Secure Trading</h3>
              <p className="text-gray-300 text-sm">Safe and transparent transactions on TON network</p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <Button 
              variant="gradient" 
              size="xl"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105"
            >
              <i className="ri-rocket-line mr-2"></i>
              Explore NFTs
            </Button>
            
            <Button 
              variant="outline" 
              size="xl"
              className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            >
              <i className="ri-play-circle-line mr-2"></i>
              Try Wheel of Fortune
            </Button>
          </motion.div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 animate-bounce">
            <i className="ri-coin-line text-yellow-400 text-3xl opacity-60"></i>
          </div>
          <div className="absolute top-40 right-20 animate-pulse">
            <i className="ri-nft-line text-purple-400 text-4xl opacity-40"></i>
          </div>
          <div className="absolute bottom-40 left-20 animate-bounce delay-1000">
            <i className="ri-trophy-line text-orange-400 text-3xl opacity-50"></i>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <i className="ri-arrow-down-line text-white text-2xl opacity-60"></i>
      </motion.div>
    </section>
  );
}
