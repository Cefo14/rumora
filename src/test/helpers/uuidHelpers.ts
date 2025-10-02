/**
 * UUID v4 format regex for validation
 */
export const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID v4 format
 */
export function isValidUUIDFormat(id: string): boolean {
  return UUID_V4_REGEX.test(id);
}

/**
 * Validates basic UUID structure (8-4-4-4-12 with hyphens)
 */
export function hasValidUUIDStructure(id: string): boolean {
  const parts = id.split('-');
  return parts.length === 5 &&
    parts[0].length === 8 &&
    parts[1].length === 4 &&
    parts[2].length === 4 &&
    parts[3].length === 4 &&
    parts[4].length === 12;
}

/**
 * Validates that the version field is 4 (UUID v4)
 */
export function hasValidUUIDVersion(id: string): boolean {
  return id.charAt(14) === '4';
}

/**
 * Validates that the variant field is correct for UUID v4
 */
export function hasValidUUIDVariant(id: string): boolean {
  const variantChar = id.charAt(19);
  return ['8', '9', 'a', 'b', 'A', 'B'].includes(variantChar);
}
