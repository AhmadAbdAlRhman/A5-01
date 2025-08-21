import React from "react";

export default function KeyInput({ keyValue, setKeyValue }) {
    // دالة لتوليد مفتاح عشوائي 64 بت
    const generateRandomKey = () => {
        let randomKey = "";
        for (let i = 0; i < 64; i++) {
            randomKey += Math.random() < 0.5 ? "0" : "1";
        }
        setKeyValue(randomKey);
    };

    return (
        <div style={{ margin: "10px 0", textAlign: "left" }}>
            <input
                type="text"
                placeholder="أدخل المفتاح (64 بت 0/1)"
                value={keyValue}
                onChange={(e) => {
                    const val = e.target.value.replace(/[^01]/g, "").slice(0, 64);
                    setKeyValue(val);
                }}
                style={{ width: "100%", padding: "8px", fontFamily: "monospace" }}
            />

            <div style={{ marginTop: "5px", fontSize: "14px", color: "#555" }}>
                الطول: {keyValue.length} / 64
            </div>

            <button
                type="button"
                onClick={generateRandomKey}
                style={{
                    marginTop: "10px",
                    background: "#28a745",
                    color: "#fff",
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
            >
                🔑 توليد مفتاح عشوائي
            </button>
        </div>
    );
}
