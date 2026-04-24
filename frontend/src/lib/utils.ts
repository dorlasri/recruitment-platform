import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' });

export const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  'in-review': 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
  hired: 'bg-green-100 text-green-800',
};

export const statusLabels: Record<string, string> = {
  new: 'חדש',
  'in-review': 'בבדיקה',
  rejected: 'נדחה',
  hired: 'התקבל',
};
