import { Request, Response, NextFunction, RequestHandler } from "express";
import { AppError } from "../../util/AppError";
import Tesseract from "tesseract.js";
import { isAadhaarCard } from "../../util/validations";

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

      const {
        data: { text: frontText },
      } = await Tesseract.recognize(frontImage.buffer, "eng+hin+mal", {
        logger: (m) => console.log("Front OCR:", m),
      });

      const {
        data: { text: backText },
      } = await Tesseract.recognize(backImage.buffer, "eng+hin+mal", {
        logger: (m) => console.log("Back OCR:", m),
      });

      const text = `${frontText}\n${backText}`;

      console.log(text)

      if (!isAadhaarCard(text)) {
        throw new AppError("Uploaded images do not appear to be Aadhaar cards", 400);
      }

      const nameLine = text
        .split("\n")
        .map((line) => line.trim())
        .find((line) => /^(name|nane|nawe)\s*[:\-]?\s*[A-Z]/i.test(line));

      const rawName =
        nameLine
          ?.match(/(?:name|nane|nawe)\s*[:\-]?\s*([A-Z][A-Z\s]{2,})/i)?.[1]
          ?.trim() ?? null;

      const name = rawName
        ?.split(/\s+/)
        .map((w) => w[0]?.toUpperCase() + w.slice(1)?.toLowerCase())
        .join(" ");

      const dob = text.match(
        /\b(0[1-9]|[12][0-9]|3[01])[-\/.](0[1-9]|1[0-2])[-\/.](19|20)\d{2}\b/
      )?.[0];

      const rawGender =
        text.match(/\b(Male|Female|Transgender|M|F|T)\b/i)?.[0] ?? null;
      const gender = rawGender
        ? rawGender[0].toUpperCase() + rawGender.slice(1).toLowerCase()
        : null;

      const aadhaar = text
        .match(/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/)?.[0]
        ?.replace(/[^\d]/g, "")
        .replace(/(\d{4})(?=\d)/g, "$1 ");

      const pincode = text.match(/\b[1-9][0-9]{5}\b/)?.[0];

      const mobile = text.match(/\b[6-9]\d{9}\b/)?.[0];

      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const pincodeLineIndex = lines.findIndex((line) =>
        line.match(/\b[1-9][0-9]{5}\b/)
      );

      const address =
        pincodeLineIndex >= 1
          ? lines
              .slice(Math.max(pincodeLineIndex - 2, 0), pincodeLineIndex + 1)
              .join(", ")
          : null;

        const guardianLine = lines.find(line =>
  /\b(S\/O|D\/O|W\/O|C\/O)\s+[A-Z\s]{3,}/i.test(line)
);

let rawGuardianName = guardianLine
  ?.match(/\b(?:S\/O|D\/O|W\/O|C\/O)\s+([A-Z\s]{3,})/i)?.[1]
  ?.trim() ?? null;

const guardianName = rawGuardianName
  ?.split(/\s+/)
  .map(w => w[0]?.toUpperCase() + w.slice(1).toLowerCase())
  .join(" ");

      res.status(200).json({
        status: true,
       data:{ 
        name,
        dob,
        gender,
        aadhaarNumber: aadhaar,
        address,
        pincode,
       mobileNumber: mobile,
       guardianName
      }
      });
    } catch (error) {
      next(error);
    }
  };
}
