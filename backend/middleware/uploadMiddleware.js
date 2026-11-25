import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Secure target directory for KYC and Lead documents
export const UPLOAD_DOCUMENTS_DIR = path.join(__dirname, '../uploads/documents');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DOCUMENTS_DIR)) {
  fs.mkdirSync(UPLOAD_DOCUMENTS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOAD_DOCUMENTS_DIR)) {
      fs.mkdirSync(UPLOAD_DOCUMENTS_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DOCUMENTS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${safeBase || 'doc'}-${uniqueSuffix}${ext}`);
  },
});

const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  if (allowedMimeTypes.includes(mime) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type '${file.mimetype}'. Only PDF, JPG, JPEG, and PNG files up to 10MB are permitted.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 Megabytes max file size
  },
  fileFilter,
});

// Middleware for multiple lead KYC document fields
export const uploadLeadDocuments = upload.fields([
  { name: 'aadhaarCard', maxCount: 1 },
  { name: 'aadhaar_card', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'pan_card', maxCount: 1 },
  { name: 'bankProof', maxCount: 1 },
  { name: 'bank_proof', maxCount: 1 },
  { name: 'salarySlip', maxCount: 1 },
  { name: 'salary_slip', maxCount: 1 },
  { name: 'itr', maxCount: 1 },
  { name: 'file', maxCount: 1 },
  { name: 'document', maxCount: 1 },
]);

// Middleware for mandatory Partner KYC registration uploads
export const uploadPartnerDocuments = upload.fields([
  { name: 'aadhaarCard', maxCount: 1 },
  { name: 'aadhaar_card', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'pan_card', maxCount: 1 },
  { name: 'bankProof', maxCount: 1 },
  { name: 'bank_proof', maxCount: 1 },
]);

// Middleware for single document re-upload or attachment
export const uploadSingleDocument = upload.single('file');

export default upload;
