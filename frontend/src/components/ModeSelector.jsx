import React from "react";

export default function ModeSelector({ mode, setMode }) {
    return (
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
    );
}
