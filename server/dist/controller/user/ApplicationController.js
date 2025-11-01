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
exports.submitApplication = submitApplication;
exports.getApplicationStatus = getApplicationStatus;
exports.listPending = listPending;
exports.getApplication = getApplication;
exports.approveApplication = approveApplication;
exports.rejectApplication = rejectApplication;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const PendingApplication_1 = __importDefault(require("../../model/user/PendingApplication"));
const nurse_1 = __importDefault(require("../../model/user/nurse"));
const caretaker_1 = __importDefault(require("../../model/user/caretaker"));
const compounder_1 = __importDefault(require("../../model/user/compounder"));
const upload_1 = require("../../utils/upload");
const roleToModel = {
    Nurse: nurse_1.default,
    Caretaker: caretaker_1.default,
    Compounder: compounder_1.default,
};
function submitApplication(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username, email, password, phone, address, profilePicture, role, documents, } = req.body || {};
            console.log("Received application submission:", {
                role,
                hasDocuments: !!documents,
                documentKeys: documents ? Object.keys(documents) : [],
                trainingCertificate: (documents === null || documents === void 0 ? void 0 : documents.trainingCertificate) ? "present" : "missing"
            });
            if (!username || !email || !password || !phone || !role) {
                return res.status(400).json({
                    message: "username, email, password, phone, role are required",
                });
            }
            if (!roleToModel[role])
                return res.status(400).json({ message: "Invalid role" });
            const passwordHash = yield bcryptjs_1.default.hash(password, 10);
            // Process profile picture: save base64 image to disk and get URL
            let processedProfilePicture;
            if (profilePicture && typeof profilePicture === "string" && profilePicture.trim()) {
                // Check if it's a base64 string (new upload) or already a URL
                if (profilePicture.startsWith("data:image/") || profilePicture.startsWith("data:application/")) {
                    // It's a base64 string, save it to disk
                    try {
                        const filename = yield (0, upload_1.saveBase64ToFile)(profilePicture, "image", "profilePicture");
                        processedProfilePicture = (0, upload_1.getFileUrl)(filename, "image");
                        console.log("Saved profile picture:", filename);
                    }
                    catch (picError) {
                        console.error("Error saving profile picture:", picError);
                        // Don't fail the entire submission if profile picture fails
                    }
                }
                else if (profilePicture.startsWith("http://") || profilePicture.startsWith("https://")) {
                    // It's already a URL, use it as is
                    processedProfilePicture = profilePicture;
                }
            }
            // Process documents: save base64 files to disk and get URLs
            let processedDocuments;
            if (documents && typeof documents === 'object') {
                processedDocuments = {};
                // Save each document to file and get URL
                try {
                    if (documents.governmentId && documents.governmentId.trim()) {
                        const filename = yield (0, upload_1.saveBase64ToFile)(documents.governmentId, "document", "governmentId");
                        processedDocuments.governmentId = (0, upload_1.getFileUrl)(filename, "document");
                        console.log("Saved governmentId:", filename);
                    }
                    if (documents.nursingRegistrationCertificate && documents.nursingRegistrationCertificate.trim()) {
                        const filename = yield (0, upload_1.saveBase64ToFile)(documents.nursingRegistrationCertificate, "document", "nursingRegistrationCertificate");
                        processedDocuments.nursingRegistrationCertificate = (0, upload_1.getFileUrl)(filename, "document");
                        console.log("Saved nursingRegistrationCertificate:", filename);
                    }
                    if (documents.trainingCertificate && documents.trainingCertificate.trim()) {
                        console.log("Processing trainingCertificate, length:", documents.trainingCertificate.length);
                        const filename = yield (0, upload_1.saveBase64ToFile)(documents.trainingCertificate, "document", "trainingCertificate");
                        processedDocuments.trainingCertificate = (0, upload_1.getFileUrl)(filename, "document");
                        console.log("Saved trainingCertificate:", filename);
                    }
                    else {
                        console.log("trainingCertificate not present or empty:", {
                            exists: !!documents.trainingCertificate,
                            type: typeof documents.trainingCertificate,
                            value: documents.trainingCertificate ? documents.trainingCertificate.substring(0, 50) : "N/A"
                        });
                    }
                    if (documents.policeVerificationCertificate && documents.policeVerificationCertificate.trim()) {
                        const filename = yield (0, upload_1.saveBase64ToFile)(documents.policeVerificationCertificate, "document", "policeVerificationCertificate");
                        processedDocuments.policeVerificationCertificate = (0, upload_1.getFileUrl)(filename, "document");
                        console.log("Saved policeVerificationCertificate:", filename);
                    }
                    console.log("Processed documents:", Object.keys(processedDocuments));
                }
                catch (docError) {
                    console.error("Error saving documents:", docError);
                    throw new Error(`Failed to save documents: ${docError instanceof Error ? docError.message : String(docError)}`);
                }
            }
            const applicationData = {
                username,
                email,
                password: passwordHash,
                phone,
                address,
                role,
            };
            if (processedProfilePicture) {
                applicationData.profilePicture = processedProfilePicture;
            }
            if (processedDocuments && Object.keys(processedDocuments).length > 0) {
                applicationData.documents = processedDocuments;
            }
            console.log("Creating application with data:", {
                role,
                documentKeys: processedDocuments ? Object.keys(processedDocuments) : [],
                processedDocuments
            });
            const created = yield PendingApplication_1.default.create(applicationData);
            console.log("Application created with documents:", JSON.stringify(created.documents, null, 2));
            return res
                .status(201)
                .json({ applicationId: created._id, status: created.status });
        }
        catch (err) {
            console.error("Submit application error:", err);
            return res
                .status(500)
                .json({ message: "Submit application failed", error: String(err) });
        }
    });
}
function getApplicationStatus(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const app = yield PendingApplication_1.default.findById(id).select("status role submittedAt");
            if (!app)
                return res.status(404).json({ message: "Not found" });
            return res.json(app);
        }
        catch (err) {
            return res
                .status(500)
                .json({ message: "Fetch status failed", error: String(err) });
        }
    });
}
function listPending(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { status = "pending" } = req.query;
            const apps = yield PendingApplication_1.default.find({ status })
                .select("username email phone role submittedAt")
                .lean();
            return res.json(apps);
        }
        catch (err) {
            return res
                .status(500)
                .json({ message: "List applications failed", error: String(err) });
        }
    });
}
function getApplication(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const app = yield PendingApplication_1.default.findById(id);
            if (!app)
                return res.status(404).json({ message: "Not found" });
            console.log("Retrieved application documents:", app.documents);
            return res.json(app);
        }
        catch (err) {
            return res
                .status(500)
                .json({ message: "Fetch application failed", error: String(err) });
        }
    });
}
function approveApplication(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const reviewerId = req.userId;
            const app = yield PendingApplication_1.default.findById(id);
            if (!app)
                return res.status(404).json({ message: "Not found" });
            if (app.status !== "pending")
                return res.status(400).json({ message: "Already processed" });
            const Model = roleToModel[app.role];
            // Map documents based on role requirements (documents are now URLs, not base64)
            let documentFields = {};
            const docs = app.documents || {};
            if (app.role === "Compounder") {
                // For compounders, use trainingCertificate or nursingRegistrationCertificate as fallback
                console.log("Compounder documents check:", {
                    governmentId: !!docs.governmentId,
                    trainingCertificate: !!docs.trainingCertificate,
                    nursingRegistrationCertificate: !!docs.nursingRegistrationCertificate,
                    policeVerificationCertificate: !!docs.policeVerificationCertificate,
                    allDocs: docs
                });
                const trainingCert = docs.trainingCertificate || docs.nursingRegistrationCertificate;
                if (!docs.governmentId || !trainingCert || !docs.policeVerificationCertificate) {
                    return res.status(400).json({
                        message: "Missing required documents for Compounder: governmentId, trainingCertificate (or nursingRegistrationCertificate), and policeVerificationCertificate are required.",
                        received: {
                            governmentId: !!docs.governmentId,
                            trainingCertificate: !!docs.trainingCertificate,
                            nursingRegistrationCertificate: !!docs.nursingRegistrationCertificate,
                            policeVerificationCertificate: !!docs.policeVerificationCertificate
                        }
                    });
                }
                documentFields = {
                    governmentId: docs.governmentId,
                    trainingCertificate: trainingCert,
                    policeVerificationCertificate: docs.policeVerificationCertificate,
                };
            }
            else if (app.role === "Nurse") {
                if (!docs.governmentId || !docs.nursingRegistrationCertificate || !docs.policeVerificationCertificate) {
                    return res.status(400).json({
                        message: "Missing required documents for Nurse: governmentId, nursingRegistrationCertificate, and policeVerificationCertificate are required."
                    });
                }
                documentFields = {
                    governmentId: docs.governmentId,
                    nursingRegistrationCertificate: docs.nursingRegistrationCertificate,
                    policeVerificationCertificate: docs.policeVerificationCertificate,
                };
            }
            else if (app.role === "Caretaker") {
                if (!docs.governmentId || !docs.policeVerificationCertificate) {
                    return res.status(400).json({
                        message: "Missing required documents for Caretaker: governmentId and policeVerificationCertificate are required."
                    });
                }
                documentFields = {
                    governmentId: docs.governmentId,
                    policeVerificationCertificate: docs.policeVerificationCertificate,
                };
            }
            const created = yield Model.create(Object.assign({ username: app.username, email: app.email, password: app.password, phone: app.phone, address: app.address, profilePicture: app.profilePicture, role: app.role }, documentFields));
            app.status = "approved";
            app.reviewedAt = new Date();
            app.reviewedBy = reviewerId;
            yield app.save();
            return res.json({ userId: created._id });
        }
        catch (err) {
            return res
                .status(500)
                .json({ message: "Approve failed", error: String(err) });
        }
    });
}
// Helper function to extract filename from URL
function extractFilenameFromUrl(url) {
    if (!url)
        return null;
    try {
        // URL format: http://localhost:7001/uploads/documents/filename.ext
        const parts = url.split("/uploads/documents/");
        if (parts.length === 2) {
            return parts[1];
        }
        return null;
    }
    catch (_a) {
        return null;
    }
}
// Helper function to delete application documents
function deleteApplicationDocuments(documents) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!documents)
            return;
        const documentsToDelete = [];
        // Collect all document URLs
        if (documents.governmentId)
            documentsToDelete.push(documents.governmentId);
        if (documents.nursingRegistrationCertificate)
            documentsToDelete.push(documents.nursingRegistrationCertificate);
        if (documents.trainingCertificate)
            documentsToDelete.push(documents.trainingCertificate);
        if (documents.policeVerificationCertificate)
            documentsToDelete.push(documents.policeVerificationCertificate);
        // Delete each document file
        const deletePromises = documentsToDelete.map((url) => __awaiter(this, void 0, void 0, function* () {
            const filename = extractFilenameFromUrl(url);
            if (filename) {
                try {
                    yield (0, upload_1.deleteFile)(filename, "document");
                    console.log("Deleted application document:", filename);
                }
                catch (err) {
                    // Log error but don't fail the entire deletion
                    console.error(`Failed to delete document file ${filename}:`, err);
                }
            }
        }));
        yield Promise.all(deletePromises);
    });
}
function rejectApplication(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { reason } = req.body || {};
            const reviewerId = req.userId;
            const app = yield PendingApplication_1.default.findById(id);
            if (!app)
                return res.status(404).json({ message: "Not found" });
            if (app.status !== "pending")
                return res.status(400).json({ message: "Already processed" });
            // Delete application documents before rejecting
            if (app.documents) {
                yield deleteApplicationDocuments(app.documents);
            }
            app.status = "rejected";
            app.rejectionReason = reason;
            app.reviewedAt = new Date();
            app.reviewedBy = reviewerId;
            yield app.save();
            return res.json({ ok: true });
        }
        catch (err) {
            return res
                .status(500)
                .json({ message: "Reject failed", error: String(err) });
        }
    });
}
