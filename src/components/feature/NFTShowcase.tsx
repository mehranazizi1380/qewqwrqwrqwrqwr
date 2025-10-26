
import { motion } from 'framer-motion';

interface NFT {
  id: number;
  name: string;
  price: string;
  image: string;
  creator: string;
  rarity: 'common' | 'rare' | 'legendary';
}

const nfts: NFT[] = [
  {
    id: 1,
    name: 'Cosmic Warrior #1247',
    price: '45.7 TON',
    image: 'https://readdy.ai/api/search-image?query=futuristic%20cosmic%20warrior%20NFT%20digital%20art%20with%20glowing%20armor%2C%20space%20background%2C%20vibrant%20colors%2C%20professional%20digital%20artwork%2C%20sci-fi%20character%20design%2C%20high%20quality%203D%20render&width=400&height=400&seq=nft1&orientation=squarish',
    creator: 'CryptoArtist',
    rarity: 'legendary'
  },
  {
    id: 2,
    name: 'Digital Dragon #892',
    price: '23.4 TON',
    image: 'https://readdy.ai/api/search-image?query=majestic%20digital%20dragon%20NFT%20artwork%20with%20crystalline%20scales%2C%20magical%20aura%2C%20fantasy%20theme%2C%20vibrant%20purple%20and%20blue%20colors%2C%20professional%20digital%20art%20style&width=400&height=400&seq=nft2&orientation=squarish',
    creator: 'DragonMaster',
    rarity: 'rare'
  },
  {
    id: 3,
    name: 'Neon City #456',
    price: '12.8 TON',
    image: 'https://readdy.ai/api/search-image?query=cyberpunk%20neon%20city%20NFT%20digital%20art%20with%20glowing%20buildings%2C%20futuristic%20architecture%2C%20purple%20and%20pink%20neon%20lights%2C%20professional%20digital%20artwork&width=400&height=400&seq=nft3&orientation=squarish',
    creator: 'NeonVision',
    rarity: 'rare'
  },
  {
    id: 4,
    name: 'Crystal Gem #789',
    price: '8.9 TON',
    image: 'https://readdy.ai/api/search-image?query=beautiful%20crystal%20gem%20NFT%20digital%20art%20with%20rainbow%20reflections%2C%20magical%20sparkles%2C%20precious%20stone%20design%2C%20professional%203D%20render%20artwork&width=400&height=400&seq=nft4&orientation=squarish',
    creator: 'GemCrafter',
    rarity: 'common'
  },
  {
    id: 5,
    name: 'Space Explorer #321',
    price: '67.2 TON',
    image: 'https://readdy.ai/api/search-image?query=space%20explorer%20astronaut%20NFT%20digital%20art%20with%20futuristic%20spacesuit%2C%20galaxy%20background%2C%20cosmic%20theme%2C%20professional%20sci-fi%20artwork&width=400&height=400&seq=nft5&orientation=squarish',
    creator: 'SpaceArt',
    rarity: 'legendary'
  },
  {
    id: 6,
    name: 'Mystic Portal #654',
    price: '19.5 TON',
    image: 'https://readdy.ai/api/search-image?query=mystical%20portal%20NFT%20digital%20art%20with%20magical%20energy%2C%20swirling%20colors%2C%20fantasy%20theme%2C%20glowing%20effects%2C%20professional%20digital%20artwork&width=400&height=400&seq=nft6&orientation=squarish',
    creator: 'MysticArts',
    rarity: 'rare'
  }
];

export default function NFTShowcase() {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      case 'rare':
        return 'from-purple-400 to-pink-500';
      default:
        return 'from-blue-400 to-cyan-500';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'border-yellow-400/50';
      case 'rare':
        return 'border-purple-400/50';
      default:
        return 'border-blue-400/50';
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900" data-product-shop>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: 'Orbitron, monospace' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Featured NFT Collections
          </motion.h2>
          <motion.p 
            className="text-gray-400 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover exclusive digital collectibles from top creators on the TON blockchain
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {nfts.map((nft, index) => (
            <motion.div
              key={nft.id}
              className={`bg-gray-800/50 backdrop-blur-sm border-2 ${getRarityBorder(nft.rarity)} rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer group`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* NFT Image */}
              <div className="relative overflow-hidden">
                <img 
                  src={nft.image} 
                  alt={nft.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute top-4 right-4 bg-gradient-to-r ${getRarityColor(nft.rarity)} px-3 py-1 rounded-full text-black text-xs font-bold uppercase`}>
                  {nft.rarity}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* NFT Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {nft.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  by <span className="text-blue-400">{nft.creator}</span>
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Current Price</p>
                    <p className="text-white font-bold text-lg">
                      <i className="ri-money-dollar-circle-line text-blue-400 mr-1"></i>
                      {nft.price}
                    </p>
                  </div>
                  <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap cursor-pointer">
                    <i className="ri-shopping-cart-line mr-2"></i>
                    Buy Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 whitespace-nowrap cursor-pointer">
            <i className="ri-gallery-line mr-2"></i>
            View All Collections
          </button>
        </motion.div>
      </div>
    </section>
  );
}
