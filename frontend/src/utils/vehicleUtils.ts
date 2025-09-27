import { BATTERY_LEVEL } from '../constants/vehicle';

/**
 * Utility functions for vehicle data
 */

/**
 * Get color for battery level display based on percentage
 */
export const getBatteryLevelColor = (percentage?: number): string => {
  if (percentage === undefined || percentage === null) {
    return 'text-gray-400';
  }
  
  if (percentage >= BATTERY_LEVEL.HIGH) {
    return 'text-green-500';
  }
  
  if (percentage >= BATTERY_LEVEL.MEDIUM) {
    return 'text-yellow-500';
  }
  
  return 'text-red-500';
};

/**
 * Get icon name for battery level display
 */
export const getBatteryLevelIcon = (percentage?: number): string => {
  if (percentage === undefined || percentage === null) {
    return 'battery';
  }
  
  return percentage <= BATTERY_LEVEL.LOW ? 'battery-low' : 'battery';
};

/**
 * Format distance in km to human-readable format
 */
export const formatDistance = (kilometers?: number): string => {
  if (kilometers === undefined || kilometers === null) {
    return 'N/A';
  }
  
  // For short distances, show as meters
  if (kilometers < 1) {
    return `${Math.round(kilometers * 1000)}m`;
  }
  
  // For regular distances, show as km with 1 decimal place
  return `${kilometers.toFixed(1)} km`;
};

/**
 * Format power in kW to human-readable format
 */
export const formatPower = (kilowatts?: number): string => {
  if (kilowatts === undefined || kilowatts === null) {
    return 'N/A';
  }
  
  return `${kilowatts.toFixed(1)} kW`;
};

/**
 * Format battery percentage to human-readable format
 */
export const formatBatteryPercentage = (percentage?: number): string => {
  if (percentage === undefined || percentage === null) {
    return 'N/A';
  }
  
  return `${Math.round(percentage)}%`;
};

/**
 * Format date to human-readable format
 */
export const formatDate = (
  dateString?: string, 
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
): string => {
  if (!dateString) {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Convert to seconds
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) {
      return 'Just now';
    }
    
    // Convert to minutes
    const diffMin = Math.floor(diffSec / 60);
    
    if (diffMin < 60) {
      return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    }
    
    // Convert to hours
    const diffHours = Math.floor(diffMin / 60);
    
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }
    
    // Convert to days
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays < 30) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }
    
    // For older dates, return the formatted date
    return formatDate(dateString);
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid Date';
  }
};
