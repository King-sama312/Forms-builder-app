"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "cookie-consent";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setShow(true);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        backgroundColor: "#c0c0c0",
        borderTop: "2px solid #fff",
        borderLeft: "2px solid #fff",
        borderRight: "2px solid #808080",
        fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', Tahoma, Geneva, sans-serif",
        fontSize: "14px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(90deg, #000080, #1084d0)",
          color: "#fff",
          fontWeight: "bold",
          padding: "3px 6px",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span style={{ fontSize: "16px", lineHeight: 1 }}>&#x26A0;</span>
        Cookie Notice
        <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "normal", opacity: 0.8 }}>
          winforms.vercel.app
        </span>
      </div>
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
        }}
      >
        <div style={{ flex: 1, lineHeight: 1.5 }}>
          This website uses third-party cookies for authentication. Since the login server is on a
          different domain, your browser must allow third-party cookies for the sign-in to work.
        </div>
        <button
          onClick={accept}
          style={{
            backgroundColor: "#c0c0c0",
            border: "2px outset #fff",
            borderColor: "#fff #808080 #808080 #fff",
            padding: "4px 16px",
            fontSize: "14px",
            fontFamily: "inherit",
            cursor: "pointer",
            whiteSpace: "nowrap",
            outline: "1px dotted #000",
            outlineOffset: "-4px",
            minWidth: "80px",
          }}
        >
          Allow
        </button>
      </div>
    </div>
  );
}
