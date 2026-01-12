/**
 * Calculate estimated reading time for a given text
 * @param text - The text content to calculate reading time for
 * @param wordsPerMinute - Average reading speed (default: 200 wpm)
 * @returns Reading time in minutes
 */
export const calculateReadingTime = (text: string, wordsPerMinute: number = 200): number => {
  if (!text) return 0;
  
  // Strip HTML tags if present
  const plainText = text.replace(/<[^>]*>/g, '');
  
  // Count words
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Calculate reading time
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  return Math.max(1, minutes);
};

/**
 * Format reading time for display
 * @param minutes - Reading time in minutes
 * @returns Formatted string like "5 min read"
 */
export const formatReadingTime = (minutes: number): string => {
  if (minutes <= 1) return "1 min read";
  return `${minutes} min read`;
};
