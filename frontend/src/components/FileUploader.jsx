import React from "react";

export default function FileUploader({ onFileChange }) {
    return (
        <div style={{ margin: "10px 0" }}>
            <input type="file" onChange={onFileChange} />
        </div>
    );
}
