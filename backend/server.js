const express = require('express');
const cors = require('cors');
const multer = require('multer');
const {
    a51XorBuffer
} = require('./a51');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024
    }
}); // حتى 100MB

function buildFilename(originalName, mode = "enc") {
    if (mode === "enc") return originalName + ".a51";
    // dec
    if (originalName.endsWith(".a51")) return originalName.replace(/\.a51$/i, ".restored");
    return originalName + ".restored";
}

function handleA51(req, res, mode) {
    const {
        key,
        frame
    } = req.body;
    if (!req.file) return res.status(400).json({
        error: "file is required (multipart/form-data field name: file)"
    });
    if (!key) return res.status(400).json({
        error: "key (64-bit hex) is required"
    });
    if (frame === undefined) return res.status(400).json({
        error: "frame (22-bit int/hex) is required"
    });

    try {
        const output = a51XorBuffer(req.file.buffer, key, frame);
        const outName = buildFilename(req.file.originalname, mode);
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(outName)}"`);
        res.send(output);
    } catch (e) {
        console.error(e);
        res.status(400).json({
            error: String(e.message || e)
        });
    }
}

app.post('/encrypt', upload.single('file'), (req, res) => handleA51(req, res, "enc"));
app.post('/decrypt', upload.single('file'), (req, res) => handleA51(req, res, "dec"));

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
    console.log(`A5/1 backend listening on :${PORT}`);
});