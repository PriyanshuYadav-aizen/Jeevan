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
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoURI = process.env.MONGODB_URI;
        const fallbackMongoURI = process.env.MONGODB_URI_LOCAL || "mongodb://127.0.0.1:27017/jeevan";
        if (!mongoURI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }
        // Connection pool settings
        const connectionOptions = {
            maxPoolSize: 50, // Maximum number of connections in the pool
            minPoolSize: 5, // Minimum number of connections in the pool
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
            serverSelectionTimeoutMS: 5000, // How long to try selecting a server
            socketTimeoutMS: 45000, // How long a send or receive on a socket can take
        };
        try {
            yield mongoose_1.default.connect(mongoURI, connectionOptions);
        }
        catch (primaryError) {
            const isDevelopment = process.env.NODE_ENV !== "production";
            if (!isDevelopment) {
                throw primaryError;
            }
            console.warn("⚠️ Primary MongoDB URI failed, retrying with local MongoDB:", primaryError);
            yield mongoose_1.default.connect(fallbackMongoURI, connectionOptions);
        }
        console.log("✅ MongoDB connected successfully");
        console.log(`📊 Connection pool configured: min=${connectionOptions.minPoolSize}, max=${connectionOptions.maxPoolSize}`);
    }
    catch (error) {
        console.error("❌ MongoDB connection error:", error);
        if (process.env.NODE_ENV === "production") {
            process.exit(1);
        }
    }
});
// Connection monitoring events
mongoose_1.default.connection.on("connected", () => {
    console.log("🔗 Mongoose connected to MongoDB");
});
mongoose_1.default.connection.on("error", (err) => {
    console.error("❌ Mongoose connection error:", err);
});
mongoose_1.default.connection.on("disconnected", () => {
    console.log("🔌 Mongoose disconnected from MongoDB");
});
mongoose_1.default.connection.on("reconnected", () => {
    console.log("🔄 Mongoose reconnected to MongoDB");
});
// Graceful shutdown
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connection.close();
        console.log("🔒 MongoDB connection closed through app termination");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error during MongoDB disconnection:", error);
        process.exit(1);
    }
}));
exports.default = connectDB;
