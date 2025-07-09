import express from 'express';
import { upload } from '../../config/multer';
import { OcrController } from '../controllers/controller';

const route = express.Router();


const controller = new OcrController();

route.post(
  "/ocr",
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
  ]),
  controller.extractData
);



export default route