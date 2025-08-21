const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors"); // ✅ استدعاء CORS

const app = express();
const upload = multer({
    dest: "uploads/"
});

// ✅ تفعيل CORS
app.use(cors({
    origin: "http://localhost:3001", // React شغال على بورت 3001
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// --- A5/1 Registers
const regXLength = 19;
const regYLength = 22;
const regZLength = 23;

let regX = [],
    regY = [],
    regZ = [];

function loadingRegisters(key) {
    regX = key.slice(0, regXLength).split("").map(Number);
    regY = key.slice(regXLength, regXLength + regYLength).split("").map(Number);
    regZ = key.slice(regXLength + regYLength, regXLength + regYLength + regZLength).split("").map(Number);

}

function setKey(key) {
    if (key.length === 64 && /^[01]+$/.test(key)) {
        loadingRegisters(key);
        return true;
    }
    return false;
}

function getMajority(x, y, z) {
    return (x + y + z > 1) ? 1 : 0;
}

function getKeystream(length) {
    let regXTemp = [...regX];
    let regYTemp = [...regY];
    let regZTemp = [...regZ];
    let keystream = [];

    for (let i = 0; i < length; i++) {
        let majority = getMajority(regXTemp[8], regYTemp[10], regZTemp[10]);

        if (regXTemp[8] === majority) {
            let newBit = regXTemp[13] ^ regXTemp[16] ^ regXTemp[17] ^ regXTemp[18];
            regXTemp.pop();
            regXTemp.unshift(newBit);
        }

        if (regYTemp[10] === majority) {
            let newBit = regYTemp[20] ^ regYTemp[21];
            regYTemp.pop();
            regYTemp.unshift(newBit);
        }

        if (regZTemp[10] === majority) {
            let newBit = regZTemp[7] ^ regZTemp[20] ^ regZTemp[21] ^ regZTemp[22];
            regZTemp.pop();
            regZTemp.unshift(newBit);
        }

        keystream.push(regXTemp[18] ^ regYTemp[21] ^ regZTemp[22]);
    }
    return keystream;
}

function bytesToBits(buffer) {
    let bits = [];
    for (let byte of buffer) {
        let bin = byte.toString(2).padStart(8, "0");
        bits.push(...bin.split("").map(Number));
    }
    return bits;
}

function bitsToBytes(bits) {
    let bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
        let byte = bits.slice(i, i + 8).join("");
        bytes.push(parseInt(byte, 2));
    }
    return Buffer.from(bytes);
}

function processFile(inputPath, outputPath, key) {
    if (!setKey(key)) {
        throw new Error("Invalid key (must be 64-bit binary string).");
    }

    const fileBuffer = fs.readFileSync(inputPath);
    let bits = bytesToBits(fileBuffer);
    let keystream = getKeystream(bits.length);
    let processedBits = bits.map((b, i) => b ^ keystream[i]);
    let processedBuffer = bitsToBytes(processedBits);

    fs.writeFileSync(outputPath, processedBuffer);
}

// --- API Routes ---

// Encrypt
app.post("/encrypt", upload.single("file"), (req, res) => {
    try {
        const key = req.body.key;
        const inputPath = req.file.path;
        const outputPath = path.join("uploads", "encrypted_" + req.file.originalname);

        processFile(inputPath, outputPath, key);

        res.download(outputPath, (err) => {
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            error: err.message, stack: err.stack
        });
    }
});

// Decrypt
app.post("/decrypt", upload.single("file"), (req, res) => {
    try {
        const key = req.body.key;
        const inputPath = req.file.path;
        const outputPath = path.join("uploads", "decrypted_" + req.file.originalname);

        processFile(inputPath, outputPath, key);

        res.download(outputPath, (err) => {
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

app.listen(3010, () => {
    console.log("🚀 Server running on http://localhost:3010");
});