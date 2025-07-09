export const isAadhaarCard =(text: string): boolean=> {
  const hasGovtText =
    text.includes("Government of India") || text.includes("भारत सरकार");
  const hasAadhaarWord =
    text.toLowerCase().includes("aadhaar") || text.includes("आधार");
  const hasAadhaarNumber = /\b[2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}\b/.test(text);

  return hasGovtText && hasAadhaarWord && hasAadhaarNumber;
}