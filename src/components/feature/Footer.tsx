
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="ri-treasure-map-line text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Pacifico, serif' }}>
                NFT GetGems & Wheel of Fortune
              </h3>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              The ultimate NFT marketplace with exciting wheel of fortune rewards. Connect your TON wallet and start winning amazing prizes!
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="ri-twitter-line text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="ri-telegram-line text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="ri-discord-line text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="ri-github-line text-xl"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Marketplace</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Explore NFTs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Create</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Collections</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Activity</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 NFT GetGems & Wheel of Fortune. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a 
              href="https://readdy.ai/?origin=logo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Powered by Readdy
            </a>
            {/* Hidden Admin Button */}
            <button
              onClick={handleAdminClick}
              className="w-2 h-2 bg-gray-800 hover:bg-gray-700 rounded-full opacity-30 hover:opacity-50 transition-all duration-300 cursor-pointer"
              title="Admin"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
