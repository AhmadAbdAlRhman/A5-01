import React, { useState } from "react";
import axios from "axios";

export default function FileEncryptor() {
  const [file, setFile] = useState(null);
  const [key, setKey] = useState("");
  const [mode, setMode] = useState("encrypt");
  const [loading, setLoading] = useState(false);

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

      const url = window.URL.createObjectURL(new Blob([response.data]));
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
    <div style={{ maxWidth: "500px", margin: "50px auto", textAlign: "center" }}>
      <h2>🔐 تشفير/فك تشفير الملفات (A5/1)</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ margin: "10px 0" }}>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <div style={{ margin: "10px 0" }}>
          <input
            type="text"
            placeholder="أدخل المفتاح (64 بت 0/1)"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ margin: "10px 0" }}>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="encrypt">تشفير الملف</option>
            <option value="decrypt">فك التشفير</option>
          </select>
        </div>
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
    </div>
  );
}
