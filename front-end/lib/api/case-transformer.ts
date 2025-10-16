/**
 * Utilities for transforming object keys between camelCase and snake_case
 */

/**
 * Convert string from camelCase to snake_case
 */
// export function toSnakeCase(str: string): string {
//   return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
// }

// /**
//  * Convert string from snake_case to camelCase
//  */
// export function toCamelCase(str: string): string {
//   return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
// }

// /**
//  * Recursively transform all keys in an object to snake_case
//  */
// export function toSnakeCaseDeep(obj: any): any {
//   if (obj === null || obj === undefined) {
//     return obj;
//   }

//   if (Array.isArray(obj)) {
//     return obj.map(item => toSnakeCaseDeep(item));
//   }

//   if (typeof obj === 'object' && obj.constructor === Object) {
//     return Object.keys(obj).reduce((acc, key) => {
//       const snakeKey = toSnakeCase(key);
//       acc[snakeKey] = toSnakeCaseDeep(obj[key]);
//       return acc;
//     }, {} as any);
//   }

//   return obj;
// }

// /**
//  * Recursively transform all keys in an object to camelCase
//  */
// export function toCamelCaseDeep(obj: any): any {
//   if (obj === null || obj === undefined) {
//     return obj;
//   }

//   if (Array.isArray(obj)) {
//     return obj.map(item => toCamelCaseDeep(item));
//   }

//   if (typeof obj === 'object' && obj.constructor === Object) {
//     return Object.keys(obj).reduce((acc, key) => {
//       const camelKey = toCamelCase(key);
//       acc[camelKey] = toCamelCaseDeep(obj[key]);
//       return acc;
//     }, {} as any);
//   }

//   return obj;
// }
