import React from "react";
import { categoryColors } from "../../data/categoryColors";
import './Resource.scss'
const Resource = ({ image, title, description, url, category }) => {
  const color = categoryColors[category] || categoryColors.Default;

  return (
    <div className="resource-card">
      <img src={image} alt={title} />
      <div className="resource-content">
        <div className="category" style={{ backgroundColor: color }}>
          {category}
        </div>
        <h2>{title}</h2>
        <p>{description}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="visit-btn">
          Visit Resource
        </a>
      </div>
    </div>
  );
};

export default Resource;;