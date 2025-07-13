// import { Request, Response, NextFunction, RequestHandler } from "express";
// import { AppError } from "../../util/AppError";
// import { isAadhaarCard } from "../../util/validations";
// import Tesseract from "tesseract.js";
// import sharp from "sharp";

// async function preprocessImage(buffer: Buffer): Promise<Buffer> {
//   return await sharp(buffer).grayscale().normalize().sharpen().toBuffer();
// }

// export class OcrController {
//   extractData: RequestHandler = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//       const frontImage = files["frontImage"]?.[0];
//       const backImage = files["backImage"]?.[0];

//       if (!frontImage || !backImage) {
//         throw new AppError("Both front and back images are required!", 400);
//       }

//       // Preprocess images
//       const [processedFront, processedBack] = await Promise.all([
//         preprocessImage(frontImage.buffer),
//         preprocessImage(backImage.buffer),
//       ]);

//       // Perform OCR in parallel
//       const [frontResult, backResult] = await Promise.all([
//         Tesseract.recognize(processedFront, "eng+hin", {
//           logger: (m) => console.log("Front OCR:", m),
//         }),
//         Tesseract.recognize(processedBack, "eng+hin", {
//           logger: (m) => console.log("Back OCR:", m),
//         }),
//       ]);

//       const text = `${frontResult.data.text}\n${backResult.data.text}`;
//       console.log("Full OCR text:\n", text);

//       if (!isAadhaarCard(text)) {
//         throw new AppError("Uploaded images do not appear to be Aadhaar cards", 400);
//       }

//       const lines = text
//         .split("\n")
//         .map(line => line.trim())
//         .filter(Boolean);

//       const nameLine = lines.find(line =>
//         /^(name|nane|nawe)\s*[:\-]?\s*[A-Z]/i.test(line)
//       );

//       const rawName = nameLine
//         ?.match(/(?:name|nane|nawe)\s*[:\-]?\s*([A-Z][A-Z\s]{2,})/i)?.[1]
//         ?.trim() ?? null;

//       const name = rawName
//         ?.split(/\s+/)
//         .map(w => w[0]?.toUpperCase() + w.slice(1).toLowerCase())
//         .join(" ");

//       const dob = text.match(
//         /\b(0[1-9]|[12][0-9]|3[01])[-/.](0[1-9]|1[0-2])[-/.](19|20)\d{2}\b/
//       )?.[0];

//       const rawGender = text.match(/\b(Male|Female|Transgender|M|F|T)\b/i)?.[0];
//       const gender = rawGender
//         ? rawGender[0].toUpperCase() + rawGender.slice(1).toLowerCase()
//         : null;

//       const aadhaar = text
//         .match(/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/)?.[0]
//         ?.replace(/[^\d]/g, "")
//         .replace(/(\d{4})(?=\d)/g, "$1 ");

//       const pincode = text.match(/\b[1-9][0-9]{5}\b/)?.[0];
//       const mobile = text.match(/\b[6-9]\d{9}\b/)?.[0];

//       const pincodeLineIndex = lines.findIndex((line) =>
//         line.match(/\b[1-9][0-9]{5}\b/)
//       );

// const address =
//         pincodeLineIndex >= 1
//           ? lines
//               .slice(Math.max(pincodeLineIndex - 2, 0), pincodeLineIndex + 1)
//               .join(", ")
//           : null;



//       const guardianLine = lines.find(line =>
//         /\b(S\/O|D\/O|W\/O|C\/O)\s+[A-Z\s]{3,}/i.test(line)
//       );

//       const rawGuardianName = guardianLine
//         ?.match(/\b(?:S\/O|D\/O|W\/O|C\/O)\s+([A-Z\s]{3,})/i)?.[1]
//         ?.trim() ?? null;

//       const guardianName = rawGuardianName
//         ?.split(/\s+/)
//         .map(w => w[0]?.toUpperCase() + w.slice(1).toLowerCase())
//         .join(" ");

//       res.status(200).json({
//         status: true,
//         data: {
//           name,
//           dob,
//           gender,
//           aadhaarNumber: aadhaar,
//           address,
//           pincode,
//           mobileNumber: mobile,
//           guardianName,
//         },
//       });
//     } catch (error) {
//       next(error);
//     }
//   };
// }


import {
  DetectDocumentTextCommand,
} from "@aws-sdk/client-textract";
import { Request, Response, NextFunction, RequestHandler } from "express";
import textractClient from "../../config/aws";
import { AppError } from "../../util/AppError";
import { isAadhaarCard } from "../../util/validations";

async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  const command = new DetectDocumentTextCommand({
    Document: { Bytes: buffer },
  });

  const response = await textractClient.send(command);

  const lines = response.Blocks?.filter(
    (b) => b.BlockType === "LINE"
  ) || [];

  return lines.map((line) => line.Text).join("\n");
}

export class OcrController {
  extractData: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const frontImage = files["frontImage"]?.[0];
      const backImage = files["backImage"]?.[0];

      if (!frontImage || !backImage) {
        throw new AppError("Both front and back images are required!", 400);
      }

      const [frontText, backText] = await Promise.all([
        extractTextFromBuffer(frontImage.buffer),
        extractTextFromBuffer(backImage.buffer),
      ]);

      const text = `${frontText}\n${backText}`;
      console.log("OCR Text:\n", text);

      if (!isAadhaarCard(frontText)) {
        throw new AppError("Uploaded frontEnd images do not appear to be Aadhaar cards", 400);
      }
      if (!isAadhaarCard(backText)) {
        throw new AppError("Uploaded backEnd images do not appear to be Aadhaar cards", 400);
      }

      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const nameLine = lines.find((line) =>
        /^(name|nane|nawe)\s*[:\-]?\s*[A-Z]/i.test(line)
      );

      const rawName = nameLine
        ?.match(/(?:name|nane|nawe)\s*[:\-]?\s*([A-Z][A-Z\s]{2,})/i)?.[1]
        ?.trim() ?? null;

      const name = rawName
        ?.split(/\s+/)
        .map((w) => w[0]?.toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

      const dob = text.match(
        /\b(0[1-9]|[12][0-9]|3[01])[-/.](0[1-9]|1[0-2])[-/.](19|20)\d{2}\b/
      )?.[0];

      const rawGender = text.match(/\b(Male|Female|Transgender|M|F|T)\b/i)?.[0];
      const gender = rawGender
        ? rawGender[0].toUpperCase() + rawGender.slice(1).toLowerCase()
        : null;

      const aadhaar = text
        .match(/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/)?.[0]
        ?.replace(/[^\d]/g, "")
        .replace(/(\d{4})(?=\d)/g, "$1 ");

      const pincode = text.match(/\b[1-9][0-9]{5}\b/)?.[0];
      const mobile = text.match(/\b[6-9]\d{9}\b/)?.[0];

      const pincodeLineIndex = lines.findIndex((line) =>
        line.match(/\b[1-9][0-9]{5}\b/)
      );

      let address = null;

const addressStartIndex = lines.findIndex((line) =>
  /^address[:\-]?$/i.test(line.trim())
);

if (addressStartIndex !== -1) {
  const rawAddressLines = lines.slice(addressStartIndex + 1, addressStartIndex + 5);

  address = rawAddressLines
    .join(", ")
    .replace(/,+/g, ",")
    .replace(/\s*-\s*-\s*/g, " - ")
    .replace(/,\s*QR Code.*$/i, "")
    .trim();
} else if (pincodeLineIndex >= 1) {
  const rawAddressLines = lines.slice(Math.max(pincodeLineIndex - 3, 0), pincodeLineIndex + 2);

  address = rawAddressLines
    .join(", ")
    .replace(/,+/g, ",")
    .replace(/\s*-\s*-\s*/g, " - ")
    .replace(/,\s*QR Code.*$/i, "")
    .trim();
}


      const guardianLine = lines.find((line) =>
        /\b(S\/O|D\/O|W\/O|C\/O)\s+[A-Z\s]{3,}/i.test(line)
      );

      const rawGuardianName = guardianLine
        ?.match(/\b(?:S\/O|D\/O|W\/O|C\/O)\s+([A-Z\s]{3,})/i)?.[1]
        ?.trim() ?? null;

      const guardianName = rawGuardianName
        ?.split(/\s+/)
        .map((w) => w[0]?.toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

      res.status(200).json({
        status: true,
        data: {
          name,
          dob,
          gender,
          aadhaarNumber: aadhaar,
          address,
          pincode,
          mobileNumber: mobile,
          guardianName,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
