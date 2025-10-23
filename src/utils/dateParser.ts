import { parse, addMonths, addYears, isValid } from 'date-fns';

export interface ParsedDate {
  manufacturingDate?: Date;
  expiryDate?: Date;
}

/**
 * Parses various date formats from product labels
 * Handles: MM/YYYY, MM-YYYY, "best before X months", "best before X years", etc.
 */
export function parseDates(text: string): ParsedDate {
  const result: ParsedDate = {};
  
  // Normalize text
  const normalizedText = text.toLowerCase().replace(/\s+/g, ' ').trim();
  
  // Extract MM/YYYY or MM-YYYY dates
  const dateRegex = /(\d{1,2})[\/\-](\d{4})/g;
  const dates: Date[] = [];
  let match;
  
  while ((match = dateRegex.exec(normalizedText)) !== null) {
    const month = parseInt(match[1]);
    const year = parseInt(match[2]);
    
    if (month >= 1 && month <= 12) {
      const date = new Date(year, month - 1, 1);
      if (isValid(date)) {
        dates.push(date);
      }
    }
  }
  
  // Look for "best before" patterns
  const bestBeforeRegex = /best\s+before\s+(\d+)\s*(month|months|year|years|yr|yrs)/i;
  const bestBeforeMatch = normalizedText.match(bestBeforeRegex);
  
  // Look for "MFG" or "Manufacturing" labels
  const mfgRegex = /(mfg|manufacturing|manufactured)\s*:?\s*(\d{1,2})[\/\-](\d{4})/i;
  const mfgMatch = normalizedText.match(mfgRegex);
  
  // Look for "EXP" or "Expiry" labels
  const expRegex = /(exp|expiry|expires)\s*:?\s*(\d{1,2})[\/\-](\d{4})/i;
  const expMatch = normalizedText.match(expRegex);
  
  if (mfgMatch) {
    const month = parseInt(mfgMatch[2]);
    const year = parseInt(mfgMatch[3]);
    result.manufacturingDate = new Date(year, month - 1, 1);
  } else if (dates.length > 0) {
    // First date is likely manufacturing date
    result.manufacturingDate = dates[0];
  }
  
  if (expMatch) {
    const month = parseInt(expMatch[2]);
    const year = parseInt(expMatch[3]);
    result.expiryDate = new Date(year, month - 1, 1);
  } else if (dates.length > 1) {
    // Second date is likely expiry date
    result.expiryDate = dates[1];
  }
  
  // If we have "best before" and manufacturing date, calculate expiry
  if (bestBeforeMatch && result.manufacturingDate && !result.expiryDate) {
    const duration = parseInt(bestBeforeMatch[1]);
    const unit = bestBeforeMatch[2].toLowerCase();
    
    if (unit.includes('year') || unit.includes('yr')) {
      result.expiryDate = addYears(result.manufacturingDate, duration);
    } else if (unit.includes('month')) {
      result.expiryDate = addMonths(result.manufacturingDate, duration);
    }
  }
  
  // If we only have one date and "best before", assume it's manufacturing
  if (!result.manufacturingDate && !result.expiryDate && dates.length === 1 && bestBeforeMatch) {
    result.manufacturingDate = dates[0];
    const duration = parseInt(bestBeforeMatch[1]);
    const unit = bestBeforeMatch[2].toLowerCase();
    
    if (unit.includes('year') || unit.includes('yr')) {
      result.expiryDate = addYears(result.manufacturingDate, duration);
    } else if (unit.includes('month')) {
      result.expiryDate = addMonths(result.manufacturingDate, duration);
    }
  }
  
  return result;
}

export function getExpiryStatus(expiryDate: Date, daysThreshold: number = 7): 'fresh' | 'expiring-soon' | 'expired' {
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'expired';
  } else if (diffDays <= daysThreshold) {
    return 'expiring-soon';
  } else {
    return 'fresh';
  }
}
