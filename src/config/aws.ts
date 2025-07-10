import { TextractClient } from "@aws-sdk/client-textract";
import dotenv from "dotenv";

dotenv.config();

const textractClient = new TextractClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default textractClient;
