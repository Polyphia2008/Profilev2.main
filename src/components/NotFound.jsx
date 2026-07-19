import React from "react";
import FuzzyText from "./FuzzyText";
import "./NotFound.css";

export default function NotFound({ onHome }) {
  return (
    <div className="nf-page">
      <div className="nf-inner">
        <FuzzyText baseIntensity={0.2} hoverIntensity={0.5} enableHover>
          404
        </FuzzyText>
        <h2 className="nf-title">Không tìm thấy trang</h2>
        <p className="nf-sub">Đường dẫn bạn vào không tồn tại trên server này.</p>
        <button className="nf-btn" onClick={onHome}>← Về trang chủ</button>
      </div>
    </div>
  );
}
