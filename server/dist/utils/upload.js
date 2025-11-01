"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = exports.uploadDocument = void 0;
exports.getFileUrl = getFileUrl;
exports.getFilePath = getFilePath;
exports.deleteFile = deleteFile;
exports.saveBase64ToFile = saveBase64ToFile;
exports.filenameToUrl = filenameToUrl;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure upload directories exist
const uploadsDir = path_1.default.join(process.cwd(), "uploads");
const documentsDir = path_1.default.join(uploadsDir, "documents");
const imagesDir = path_1.default.join(uploadsDir, "images");
// Create directories if they don't exist
[uploadsDir, documentsDir, imagesDir].forEach((dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
// Configure storage for documents
const documentStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, documentsDir);
    },
    filename: (_req, file, cb) => {
        // Generate unique filename: timestamp-random-originalname
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        const name = path_1.default.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    },
});
// Configure storage for images
const imageStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, imagesDir);
    },
    filename: (_req, file, cb) => {
        // Generate unique filename: timestamp-random-originalname
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        const name = path_1.default.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    },
});
// File filter for documents
const documentFileFilter = (_req, file, cb) => {
    // Allow PDF, DOC, DOCX, and image files
    const allowedMimes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/jpg",
        "image/png",
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed."));
    }
};
// File filter for images
const imageFileFilter = (_req, file, cb) => {
    // Allow only image files
    const allowedMimes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP images are allowed."));
    }
};
// Multer instance for documents
exports.uploadDocument = (0, multer_1.default)({
    storage: documentStorage,
    fileFilter: documentFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
// Multer instance for images
exports.uploadImage = (0, multer_1.default)({
    storage: imageStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
// Helper function to get file URL
function getFileUrl(filename, type) {
    const baseUrl = process.env.BASE_URL || "http://localhost:7001";
    const folder = type === "document" ? "documents" : "images";
    return `${baseUrl}/uploads/${folder}/${filename}`;
}
// Helper function to get file path
function getFilePath(filename, type) {
    const folder = type === "document" ? documentsDir : imagesDir;
    return path_1.default.join(folder, filename);
}
// Helper function to delete file
function deleteFile(filename, type) {
    return new Promise((resolve, reject) => {
        const filePath = getFilePath(filename, type);
        fs_1.default.unlink(filePath, (err) => {
            if (err && err.code !== "ENOENT") {
                // ENOENT means file doesn't exist, which is fine
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
// Helper function to save base64 to file (for backward compatibility)
function saveBase64ToFile(base64String, type, originalName) {
    return __awaiter(this, void 0, void 0, function* () {
        // Remove data URL prefix if present (e.g., "data:image/png;base64,")
        const base64Data = base64String.replace(/^data:[\w\/]+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        // Determine file extension from base64 or use default
        let ext = ".png"; // default
        if (originalName) {
            ext = path_1.default.extname(originalName);
        }
        else if (base64String.startsWith("data:image/")) {
            const match = base64String.match(/data:image\/(\w+);base64/);
            if (match)
                ext = `.${match[1]}`;
        }
        else if (base64String.startsWith("data:application/pdf")) {
            ext = ".pdf";
        }
        // Generate unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = `file-${uniqueSuffix}${ext}`;
        // Save to appropriate directory
        const folder = type === "document" ? documentsDir : imagesDir;
        const filePath = path_1.default.join(folder, filename);
        return new Promise((resolve, reject) => {
            fs_1.default.writeFile(filePath, buffer, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(filename);
                }
            });
        });
    });
}
// Helper to convert filename to URL (for returning in API responses)
function filenameToUrl(filename, type) {
    return getFileUrl(filename, type);
}
