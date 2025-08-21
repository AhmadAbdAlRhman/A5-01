import React, { useState } from "react";
import axios from "axios";
import FileUploader from "../components/FileUploader";
import KeyInput from "../components/KeyInput";
import ModeSelector from "../components/ModeSelector";
import AudioPlayer from "../components/AudioPlayer";

export default function FileEncryptor() {
    const [file, setFile] = useState(null);
    const [key, setKey] = useState("");
    const [mode, setMode] = useState("encrypt");
    const [loading, setLoading] = useState(false);
    const [previewURL, setPreviewURL] = useState(null);
    const [resultURL, setResultURL] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        if (selectedFile && selectedFile.type.startsWith("audio/")) {
            setPreviewURL(URL.createObjectURL(selectedFile));
        } else {
            setPreviewURL(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !key) {
            alert("يرجى رفع الملف وإدخال المفتاح");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("key", key);

        try {
            setLoading(true);
            const response = await axios.post(
                `http://localhost:3010/${mode}`,
                formData,
                { responseType: "blob" }
            );

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            setResultURL(url);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${mode}_${file.name}`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            alert("خطأ: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "50px auto", textAlign: "center" }}>
            <h2>🔐 تشفير/فك تشفير الملفات (A5/1)</h2>
            <form onSubmit={handleSubmit}>
                <FileUploader onFileChange={handleFileChange} />
                <AudioPlayer title="🎵 الملف الأصلي" src={previewURL} />
                <KeyInput keyValue={key} setKeyValue={setKey} />
                <ModeSelector mode={mode} setMode={setMode} />
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: "#007bff",
                        color: "#fff",
                        padding: "10px 20px",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    {loading ? "جار المعالجة..." : "تنفيذ"}
                </button>
            </form>
            <AudioPlayer title="▶️ الملف الناتج" src={resultURL} />
        </div>
    );
}
