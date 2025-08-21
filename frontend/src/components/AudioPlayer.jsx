import React from "react";

export default function AudioPlayer({ title, src }) {
    if (!src) return null;

    return (
        <div style={{ marginTop: "30px" }}>
            <h3>{title}</h3>
            <audio controls src={src}></audio>
        </div>
    );
}
