
import { useEffect } from 'react';
import Header from '../../components/feature/Header';
import HeroSection from '../../components/feature/HeroSection';
import StatsSection from '../../components/feature/StatsSection';
import NFTShowcase from '../../components/feature/NFTShowcase';
import WheelOfFortune from '../../components/feature/WheelOfFortune';
import ReferralSection from '../../components/feature/ReferralSection';
import Footer from '../../components/feature/Footer';
import { tonWalletService } from '../../services/tonService';
import { referralService } from '../../services/referralService';

export default function HomePage() {
  useEffect(() => {
    // Load services data from storage
    tonWalletService.loadFromStorage();
    referralService.loadFromStorage();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Header />
      <HeroSection />
      <StatsSection />
      <NFTShowcase />
      <WheelOfFortune />
      <ReferralSection />
      <Footer />
    </div>
  );
}
