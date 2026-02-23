export interface Admin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support';

export interface AdminLoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface AdminLoginResponse {
  admin: Admin;
  token: string;
  refreshToken: string;
}

export interface AdminActionLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

export interface AuditLogFilters {
  adminId?: string;
  action?: string;
  entityType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsersToday: number;
  totalTradingVolume24h: number;
  totalRevenue: number;
  pendingKYC: number;
  pendingWithdrawals: number;
  pendingDeposits: number;
  activeTrades: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
}
