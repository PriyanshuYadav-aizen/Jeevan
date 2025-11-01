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
exports.createStaff = createStaff;
exports.listStaff = listStaff;
exports.getStaff = getStaff;
exports.updateStaff = updateStaff;
exports.deleteStaff = deleteStaff;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const staff_1 = __importDefault(require("../../model/user/staff"));
const upload_1 = require("../../utils/upload");
function createStaff(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username, email, password, phone, address, profilePicture } = req.body || {};
            if (!username || !email || !password || !phone) {
                return res
                    .status(400)
                    .json({ message: "username, email, password, phone are required" });
            }
            const existing = yield staff_1.default.findOne({ email }).lean();
            if (existing)
                return res.status(409).json({ message: "Email already registered" });
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
                    }
                    catch (picError) {
                        console.error("Error saving profile picture:", picError);
                        // Don't fail the entire creation if profile picture fails
                    }
                }
                else if (profilePicture.startsWith("http://") || profilePicture.startsWith("https://")) {
                    // It's already a URL, use it as is
                    processedProfilePicture = profilePicture;
                }
            }
            const created = yield staff_1.default.create({
                username,
                email,
                password: passwordHash,
                phone,
                address,
                profilePicture: processedProfilePicture,
                role: "Staff",
            });
            return res.status(201).json({ id: created._id, username: created.username, email: created.email, phone: created.phone, role: "Staff" });
        }
        catch (err) {
            return res
                .status(500)
                .json({ message: "Create staff failed", error: String(err) });
        }
    });
}
function listStaff(_req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const items = yield staff_1.default.find().select("username email phone address profilePicture").lean();
            return res.json(items);
        }
        catch (err) {
            return res
                .status(500)
                .json({ message: "List staff failed", error: String(err) });
        }
    });
}
function getStaff(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const staff = yield staff_1.default.findById(id).select("username email phone address profilePicture");
            if (!staff)
                return res.status(404).json({ message: "Not found" });
            return res.json(staff);
        }
        catch (err) {
            return res
                .status(500)
                .json({ message: "Get staff failed", error: String(err) });
        }
    });
}
function updateStaff(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const { id } = req.params;
            const { username, email, phone, address, profilePicture } = req.body || {};
            // Get current staff to check for old profile picture
            const currentStaff = yield staff_1.default.findById(id);
            if (!currentStaff)
                return res.status(404).json({ message: "Not found" });
            // Process profile picture: save base64 image to disk and get URL
            let processedProfilePicture = (_a = currentStaff.profilePicture) !== null && _a !== void 0 ? _a : undefined; // Keep existing by default
            if (profilePicture && typeof profilePicture === "string" && profilePicture.trim()) {
                // Check if it's a base64 string (new upload) or already a URL
                if (profilePicture.startsWith("data:image/") || profilePicture.startsWith("data:application/")) {
                    // It's a base64 string, save it to disk
                    try {
                        // Delete old profile picture if it exists
                        if (currentStaff.profilePicture) {
                            const oldUrl = currentStaff.profilePicture;
                            if (oldUrl.includes("/uploads/images/")) {
                                const filename = oldUrl.split("/uploads/images/")[1];
                                if (filename) {
                                    try {
                                        yield (0, upload_1.deleteFile)(filename, "image");
                                    }
                                    catch (delError) {
                                        console.error("Error deleting old profile picture:", delError);
                                    }
                                }
                            }
                        }
                        const filename = yield (0, upload_1.saveBase64ToFile)(profilePicture, "image", "profilePicture");
                        processedProfilePicture = (0, upload_1.getFileUrl)(filename, "image");
                    }
                    catch (picError) {
                        console.error("Error saving profile picture:", picError);
                        // Don't fail the entire update if profile picture fails
                    }
                }
                else if (profilePicture.startsWith("http://") || profilePicture.startsWith("https://")) {
                    // It's already a URL, use it as is
                    processedProfilePicture = profilePicture;
                }
            }
            const updated = yield staff_1.default.findByIdAndUpdate(id, { $set: { username, email, phone, address, profilePicture: processedProfilePicture } }, { new: true }).select("username email phone address profilePicture");
            if (!updated)
                return res.status(404).json({ message: "Not found" });
            return res.json(updated);
        }
        catch (err) {
            return res
                .status(500)
                .json({ message: "Update staff failed", error: String(err) });
        }
    });
}
function deleteStaff(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            // Get staff first to delete profile picture
            const staff = yield staff_1.default.findById(id);
            if (!staff)
                return res.status(404).json({ message: "Not found" });
            // Delete profile picture if it exists and is in our uploads directory
            if (staff.profilePicture) {
                const profilePicUrl = staff.profilePicture;
                if (profilePicUrl.includes("/uploads/images/")) {
                    const filename = profilePicUrl.split("/uploads/images/")[1];
                    if (filename) {
                        try {
                            yield (0, upload_1.deleteFile)(filename, "image");
                        }
                        catch (delError) {
                            console.error("Error deleting profile picture:", delError);
                            // Don't fail the deletion if image deletion fails
                        }
                    }
                }
            }
            const deleted = yield staff_1.default.findByIdAndDelete(id);
            if (!deleted)
                return res.status(404).json({ message: "Not found" });
            return res.status(204).send();
        }
        catch (err) {
            return res
                .status(500)
                .json({ message: "Delete staff failed", error: String(err) });
        }
    });
}
