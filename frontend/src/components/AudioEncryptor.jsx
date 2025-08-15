import React, { useState } from "react";
import { Button, Typography } from "@mui/material";

export default function AudioEncryptor() {
  const [file, setFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleEncrypt = async () => {
    if (!file) return alert("اختر ملف صوتي أولاً!");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:3010/encrypt", {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();
    setDownloadUrl(URL.createObjectURL(blob));
  };

  const handleDecrypt = async () => {
    if (!file) return alert("اختر ملف صوتي أولاً!");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:3010/decrypt", {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();
    setDownloadUrl(URL.createObjectURL(blob));
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h5" gutterBottom>
        🎵 تطبيق تشفير/فك تشفير صوت
      </Typography>

      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        style={{ marginBottom: 10 }}
      />

      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleEncrypt}
          style={{ marginRight: 10 }}
        >
          تشفير
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleDecrypt}
        >
          فك التشفير
        </Button>
      </div>

      {downloadUrl && (
        <div style={{ marginTop: 20 }}>
          <Typography>📥 حمل الملف الناتج:</Typography>
          <a href={downloadUrl} download="output.wav">
            تحميل
          </a>
        </div>
      )}
    </div>
  );
}
