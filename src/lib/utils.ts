
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function calculateDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  
  // Reset time component to avoid time zone issues
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function getRelativeDateLabel(dueDate: string): {
  label: string;
  status: 'overdue' | 'today' | 'upcoming' | 'future';
} {
  const daysUntil = calculateDaysUntilDue(dueDate);
  
  if (daysUntil < 0) {
    return { label: `${Math.abs(daysUntil)} days overdue`, status: 'overdue' };
  } else if (daysUntil === 0) {
    return { label: 'Due today', status: 'today' };
  } else if (daysUntil <= 7) {
    return { label: `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`, status: 'upcoming' };
  } else {
    return { label: `Due in ${daysUntil} days`, status: 'future' };
  }
}


export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};
