export interface ReferralStats {
  totalReferrals: number;
  level1Count: number;
  level2Count: number;
  level3Count: number;
  totalEarnings: number;
  level1Earnings: number;
  level2Earnings: number;
  level3Earnings: number;
  pendingEarnings: number;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  level: 1 | 2 | 3;
  status: 'active' | 'inactive';
  earnings: number;
  createdAt: string;
  referred?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    createdAt: string;
  };
}

export interface ReferralEarning {
  id: string;
  referrerId: string;
  referredId: string;
  tradeId: string;
  level: 1 | 2 | 3;
  amount: number;
  percentage: number;
  createdAt: string;
  trade?: {
    id: string;
    amount: number;
    price: number;
  };
  referred?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ReferralTreeNode {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  level: number;
  earnings: number;
  referrals: ReferralTreeNode[];
  joinedAt: string;
}

export interface ReferralCommission {
  level: number;
  percentage: number;
  minTradeAmount: number;
}
