
import { useState, useEffect } from 'react';

interface Winner {
  address: string;
  prize: string;
  amount: string;
  time: string;
}

const generateRandomWinner = (): Winner => {
  const addresses = [
    'UQAb...7x9K', 'UQCd...2m8L', 'UQEf...5n1P', 'UQGh...8q4R', 'UQIj...1t7S',
    'UQLk...4w0T', 'UQMn...7z3U', 'UQOp...0c6V', 'UQQr...3f9W', 'UQSt...6i2X',
    'UQUv...9l5Y', 'UQWx...2o8Z', 'UQYz...5r1A', 'UQAa...8u4B', 'UQCc...1x7C',
    'UQEe...4a0D', 'UQGg...7d3E', 'UQIi...0g6F', 'UQKk...3j9G', 'UQMm...6m2H'
  ];
  
  const prizes = [
    { name: '🎯 TON Coins', amounts: ['50', '100', '250', '500', '1000'] },
    { name: '💎 NFT Gems', amounts: ['5', '10', '25', '50', '100'] },
    { name: '🎁 Bonus Spins', amounts: ['3', '5', '10', '20', '50'] },
    { name: '🏆 Mega Prize', amounts: ['2500', '5000', '10000'] },
    { name: '⭐ Special NFT', amounts: ['1', '2', '3'] }
  ];

  const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];
  const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
  const randomAmount = randomPrize.amounts[Math.floor(Math.random() * randomPrize.amounts.length)];
  
  const now = new Date();
  const randomMinutes = Math.floor(Math.random() * 30);
  const winTime = new Date(now.getTime() - randomMinutes * 60000);
  
  return {
    address: randomAddress,
    prize: randomPrize.name,
    amount: randomAmount,
    time: `${randomMinutes}m ago`
  };
};

export default function StatsSection() {
  const [recentWinners, setRecentWinners] = useState<Winner[]>([]);

  // Initialize with some winners
  useEffect(() => {
    const initialWinners = Array.from({ length: 5 }, () => generateRandomWinner());
    setRecentWinners(initialWinners);
  }, []);

  // Update winners every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentWinners(prev => {
        const newWinner = generateRandomWinner();
        const updated = [newWinner, ...prev.slice(0, 4)];
        return updated;
      });
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-2xl p-8">
              <i className="ri-user-line text-4xl text-blue-400 mb-4"></i>
              <div className="text-3xl font-bold text-white mb-2">2.5M+</div>
              <div className="text-blue-300">Active Users</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-2xl p-8">
              <i className="ri-trophy-line text-4xl text-green-400 mb-4"></i>
              <div className="text-3xl font-bold text-white mb-2">$15M+</div>
              <div className="text-green-300">Prizes Distributed</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-2xl p-8">
              <i className="ri-treasure-map-line text-4xl text-purple-400 mb-4"></i>
              <div className="text-3xl font-bold text-white mb-2">850K+</div>
              <div className="text-purple-300">NFTs Traded</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-8">
              <i className="ri-flashlight-line text-4xl text-yellow-400 mb-4"></i>
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-yellow-300">Uptime</div>
            </div>
          </div>
        </div>

        {/* Recent Winners */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <i className="ri-trophy-line text-yellow-400 mr-3"></i>
              Recent Winners
            </h3>
            <div className="flex items-center text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm">Live Updates</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {recentWinners.map((winner, index) => (
              <div 
                key={`${winner.address}-${winner.time}-${index}`}
                className="flex items-center justify-between bg-gray-900/50 border border-gray-600 rounded-xl p-4 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <i className="ri-user-line text-white"></i>
                  </div>
                  <div>
                    <div className="font-mono text-blue-400 font-bold">{winner.address}</div>
                    <div className="text-gray-400 text-sm">{winner.time}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-bold">{winner.prize}</div>
                  <div className="text-yellow-400 font-bold">{winner.amount}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              🎉 Winners updated every 30 seconds • Join now and be the next winner!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
