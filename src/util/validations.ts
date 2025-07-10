export const isAadhaarCard = (text: string): boolean => {
  const cleanedText = text.replace(/\s+/g, ' ').trim().toLowerCase();

  const hasGovtHint = /(government\s+of\s+india|भारत\s+सरकार|govt[\s.]?of[\s.]?india|unique\s+identification\s+authority)/.test(cleanedText);
  const hasAadhaarHint = /(aadhaar\s+card|aadhaar|aadhar\s+card|aadhar|आधार)/.test(cleanedText);
  const has12DigitNumber = /\b[2-9]{1}[0-9]{3}[\s-]?[0-9]{4}[\s-]?[0-9]{4}\b/.test(cleanedText);

  return (hasGovtHint && hasAadhaarHint) || (hasGovtHint && has12DigitNumber);
};
