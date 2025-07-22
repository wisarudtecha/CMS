// /src/utils/camelToCap.ts
export const camelToCap = (input: string): string => {
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2') // insert space before capital letters
    .replace(/^./, str => str.toUpperCase()) // capitalize the first letter
    .replace(/\b\w/g, str => str.toUpperCase()); // capitalize each word
}
