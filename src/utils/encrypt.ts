import crypto from "crypto";

export const encryptData = (data: string) => {
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
        throw new Error("ENCRYPTION_KEY must be exactly 32 characters long");
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted; // Store IV with encrypted data
};


export const decryptData = (encryptedData: string) => {
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
    if (!ENCRYPTION_KEY) {
        return
    }

    const parts = encryptedData.split(":");
    if (parts.length !== 2) throw new Error("Invalid encrypted data format");

    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];

    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
};


