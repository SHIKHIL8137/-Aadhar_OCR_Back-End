# 🧠 OCR Backend (Express + Tesseract.js)

This is a Node.js (Express) backend that performs OCR (Optical Character Recognition) on Aadhaar card images using `tesseract.js`. It supports extracting name, DOB, gender, Aadhaar number, address, and mobile number from front and back images.

---

## 🚀 Features

- ✅ OCR using Tesseract.js (WASM-based — no native binaries needed)
- ✅ Accepts Aadhaar front & back image uploads
- ✅ Extracts structured data from OCR result
- ✅ Built with TypeScript
- ✅ Dockerized for easy deployment
- ✅ .env support

---

## 📦 Tech Stack

- Node.js + Express
- TypeScript
- Tesseract.js (`eng`, `hin`, `mal` trained)
- Multer (for image uploads)
- dotenv
- Docker

---

## 🛠 Setup (Local Development)

### 1. Clone the repository

```bash
git clone https://github.com/SHIKHIL8137/-Aadhar_OCR_Back-End.git
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

---

## 🐳 Run in Docker (Production)

### 1. Build the Docker image

```bash
docker build -t ocr-backend .
```

### 2. Run the container

```bash
docker run -p 5000:5000 --env-file .env ocr-backend
```

Your backend will be available at: [http://localhost:5000](http://localhost:5000)

---

## 📤 API Endpoint

### `POST /api/ocr`

**Description**: Accepts Aadhaar front and back image files and returns extracted data.

#### Request (Form-Data)

| Key         | Type    | Required | Description              |
|-------------|---------|----------|--------------------------|
| `frontImage`| `File`  | ✅        | Front side of Aadhaar    |
| `backImage` | `File`  | ✅        | Back side of Aadhaar     |

#### Response

```json
{
  "status": true,
  "data": {
    "name": "Amit Kumar",
    "dob": "20/08/1996",
    "gender": "Male",
    "aadhaarNumber": "1234 5678 9012",
    "address": "Some Address, City, State, 682020",
    "pincode": "682020",
    "mobileNumber": "9876543210"
  }
}
```

---

## 🔒 CORS Configuration

Make sure CORS is enabled to allow requests from the frontend:

```ts
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

---

## 🧪 Preview Build (Optional)

To test the production build locally:

```bash
npm run build
node dist/app.js
```

---

## ✍️ Author

Built with ❤️ by [Your Name](https://github.com/yourusername)

---

## 📄 License

This project is licensed under the MIT License.
