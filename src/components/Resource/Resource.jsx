// Resource.jsx
import React from 'react';
import './Resource.scss';

const Resource = ({ image, title, description, url, category }) => {
  return (
    <div className="resource-card">
      {image && <img src={image} alt={title} className="resource-image" />}
      <div className="resource-content">
        {category && <span className="resource-category">{category}</span>}
        <h3 className="resource-title">{title}</h3>
        <p className="resource-description">{description}</p>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="resource-link">
            Learn More
          </a>
        )}
      </div>
    </div>
  );
};

export default Resource;