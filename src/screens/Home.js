import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="Home">
      <button
        onClick={() => {
          navigate("windows");
        }}
      >
        النوافذ
      </button>
    </div>
  );
}
