import { format, parseISO } from 'date-fns';
import { CURRENCY_SYMBOLS, DATE_FORMATS } from './constants';

// Format currency
export const formatCurrency = (
  value: number,
  currency: string = 'USD',
  decimals: number = 2
): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const formattedValue = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol}${formattedValue}`;
};

// Format crypto amount
export const formatCrypto = (
  value: number,
  currency: string = 'USDT',
  decimals: number = 6
): string => {
  const formattedValue = value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  return `${formattedValue} ${currency}`;
};

// Format date
export const formatDate = (
  date: string | Date,
  formatStr: string = DATE_FORMATS.DISPLAY
): string => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch {
    return '-';
  }
};

// Format short date
export const formatShortDate = (date: string | Date): string => {
  return formatDate(date, DATE_FORMATS.DISPLAY_SHORT);
};

// Format relative time
export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(date);
  } catch {
    return '-';
  }
};

// Format number with commas
export const formatNumber = (value: number): string => {
  return value.toLocaleString('en-US');
};

// Format percentage
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

// Format phone number
export const formatPhone = (phone: string): string => {
  if (!phone) return '-';
  // Simple formatting for international numbers
  if (phone.startsWith('+')) {
    return phone;
  }
  return `+${phone}`;
};

// Truncate text
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Truncate middle (for addresses/IDs)
export const truncateMiddle = (
  text: string,
  startChars: number = 6,
  endChars: number = 4
): string => {
  if (!text || text.length <= startChars + endChars) return text;
  return `${text.substring(0, startChars)}...${text.substring(text.length - endChars)}`;
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Format status for display
export const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get initials from name
export const getInitials = (name: string): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Format referral code
export const formatReferralCode = (code: string): string => {
  return code.toUpperCase();
};

// Format UPI ID
export const formatUPIId = (upiId: string): string => {
  return upiId.toLowerCase();
};

// Mask sensitive data
export const maskSensitive = (
  value: string,
  visibleStart: number = 2,
  visibleEnd: number = 2
): string => {
  if (!value || value.length <= visibleStart + visibleEnd) return value;
  const start = value.substring(0, visibleStart);
  const end = value.substring(value.length - visibleEnd);
  const masked = '*'.repeat(value.length - visibleStart - visibleEnd);
  return `${start}${masked}${end}`;
};

// Mask bank account
export const maskBankAccount = (accountNumber: string): string => {
  return maskSensitive(accountNumber, 0, 4);
};

// Mask phone number
export const maskPhone = (phone: string): string => {
  return maskSensitive(phone, 3, 2);
};

// Mask email
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email;
  const [localPart, domain] = email.split('@');
  const maskedLocal = maskSensitive(localPart, 2, 1);
  return `${maskedLocal}@${domain}`;
};
