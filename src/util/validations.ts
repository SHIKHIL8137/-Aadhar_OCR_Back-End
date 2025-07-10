export const isAadhaarCard = (text: string): boolean => {
  const cleanedText = text.replace(/\s+/g, ' ').trim().toLowerCase();

  const govtKeywords = [
    "government of india",
    "govt. of india",
    "govt of india",
    "भारत सरकार",
    "भारतीय विशिष्ट पहचान प्राधिकरण",
    "ഭാരത് സർക്കാർ",
    "ഭാരതിയ സവിശേഷ തിരിച്ചറിയൽ അതോറിറ്റി","Unique Identification Authority of India"
  ];
  console.log(cleanedText)
  const hasGovtText = govtKeywords.some(keyword => cleanedText.includes(keyword));

  const aadhaarKeywords = [
    "aadhaar",
    "aadhaar card",
    "aadhar",
    "aadhar card",
    "आधार",
    "Aadhaar"
  ];
  const hasAadhaarWord = aadhaarKeywords.some(keyword => cleanedText.includes(keyword));

  const aadhaarNumberMatch = cleanedText.match(/\b[2-9]{1}[0-9]{3}[ -]?[0-9]{4}[ -]?[0-9]{4}\b/);
  const hasAadhaarNumber = aadhaarNumberMatch !== null;

  const startsWithValidDigit = aadhaarNumberMatch ? /^[2-9]/.test(aadhaarNumberMatch[0]) : false;

  const hasDob = /(dob|date of birth|जन्म तिथि)/i.test(text);
  const hasGender = /(male|female|other|पुरुष|महिला)/i.test(text);
  const hasNameLikeField = /(name|नाम)/i.test(text);
  console.log(hasGovtText)
  console.log(hasAadhaarWord)
  console.log(hasAadhaarNumber)
  console.log(startsWithValidDigit)
  return (
    hasGovtText &&
    hasAadhaarWord &&
    hasAadhaarNumber &&
    startsWithValidDigit &&
    (hasDob || hasGender || hasNameLikeField)
  );
};
