
import { useState, useEffect } from 'react';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import { tonWalletService } from '../../services/tonService';
import LanguageSelector from './LanguageSelector';
import Button from '../base/Button';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userFriendlyAddress = useTonAddress();

  useEffect(() => {
    if (userFriendlyAddress) {
      tonWalletService.addConnectedWallet(userFriendlyAddress);
    }
  }, [userFriendlyAddress]);

  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="ri-nft-line text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Pacifico, serif' }}>
                NFT GetGems
              </h1>
              <p className="text-xs text-gray-400">& Wheel of Fortune</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <i className="ri-home-line mr-2"></i>Home
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <i className="ri-gallery-line mr-2"></i>Collections
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <i className="ri-trophy-line mr-2"></i>Wheel
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <i className="ri-bar-chart-line mr-2"></i>Stats
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <i className="ri-user-line mr-2"></i>Profile
            </a>
          </nav>

          {/* Connect Wallet, Language & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>
            <div className="hidden sm:block">
              <TonConnectButton />
            </div>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <nav className="flex flex-col space-y-3">
              <a href="#" className="text-gray-300 hover:text-white transition-colors py-2">
                <i className="ri-home-line mr-2"></i>Home
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors py-2">
                <i className="ri-gallery-line mr-2"></i>Collections
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors py-2">
                <i className="ri-trophy-line mr-2"></i>Wheel
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors py-2">
                <i className="ri-bar-chart-line mr-2"></i>Stats
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors py-2">
                <i className="ri-user-line mr-2"></i>Profile
              </a>
              <div className="pt-3 space-y-3">
                <LanguageSelector />
                <TonConnectButton />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
