
export interface ReferralData {
  userId: string;
  referralCode: string;
  referredUsers: string[];
  totalReferrals: number;
  bonusSpins: number;
  createdAt: number;
}

export class ReferralService {
  private static instance: ReferralService;
  private referralData: Map<string, ReferralData> = new Map();

  static getInstance(): ReferralService {
    if (!ReferralService.instance) {
      ReferralService.instance = new ReferralService();
    }
    return ReferralService.instance;
  }

  generateReferralCode(userId: string): string {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const referralData: ReferralData = {
      userId,
      referralCode: code,
      referredUsers: [],
      totalReferrals: 0,
      bonusSpins: 0,
      createdAt: Date.now(),
    };
    
    this.referralData.set(userId, referralData);
    this.saveToStorage();
    return code;
  }

  getReferralLink(userId: string): string {
    const data = this.referralData.get(userId);
    if (!data) {
      const code = this.generateReferralCode(userId);
      return `${window.location.origin}?ref=${code}`;
    }
    return `${window.location.origin}?ref=${data.referralCode}`;
  }

  processReferral(referralCode: string, newUserId: string): boolean {
    for (const [userId, data] of this.referralData) {
      if (data.referralCode === referralCode && !data.referredUsers.includes(newUserId)) {
        data.referredUsers.push(newUserId);
        data.totalReferrals++;
        data.bonusSpins++;
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  getReferralData(userId: string): ReferralData | null {
    return this.referralData.get(userId) || null;
  }

  getAllReferralData(): ReferralData[] {
    return Array.from(this.referralData.values());
  }

  private saveToStorage() {
    const data = Array.from(this.referralData.entries());
    localStorage.setItem('referralData', JSON.stringify(data));
  }

  loadFromStorage() {
    const data = localStorage.getItem('referralData');
    if (data) {
      const entries = JSON.parse(data);
      this.referralData = new Map(entries);
    }
  }
}

export const referralService = ReferralService.getInstance();
