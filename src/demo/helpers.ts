/**
 * Updates text content of an element by ID
 */
export function updateElement(id: string, value: string | number): void {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}

/**
 * Updates rating badge styling based on thresholds
 */
export function updateRating(
  id: string, 
  value: number, 
  goodThreshold: number, 
  poorThreshold: number
): void {
  const el = document.getElementById(id);
  if (!el) return;
  
  let rating: string;
  let bgClass: string;
  let textClass: string;
  
  if (value < goodThreshold) {
    rating = 'GOOD';
    bgClass = 'bg-green-100';
    textClass = 'text-green-700';
  } else if (value < poorThreshold) {
    rating = 'NEEDS IMPROVEMENT';
    bgClass = 'bg-yellow-100';
    textClass = 'text-yellow-700';
  } else {
    rating = 'POOR';
    bgClass = 'bg-red-100';
    textClass = 'text-red-700';
  }
  
  el.textContent = rating;
  el.className = `px-3 py-1 rounded-full text-xs font-bold ${bgClass} ${textClass}`;
}

/**
 * Formats bytes to KB
 */
export function toKB(bytes: number): string {
  return (bytes / 1024).toFixed(1);
}