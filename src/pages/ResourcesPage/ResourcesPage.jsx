import React, { useState, useMemo } from "react";
import Resource from "../../components/Resource/Resource";
import "./ResourcesPage.scss";
import Nav from "../../components/Nav/Nav";
import { resourcesData } from "../../data/resourcesData";
import Footer from "../../components/Footer/Footer";

const ResourcesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("");

  // Dynamically get all unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(resourcesData.map((r) => r.category))).sort();
  }, []);

  // Filtered resources based on selected category
  const filteredResources = useMemo(() => {
    if (!selectedCategory) return resourcesData;
    return resourcesData.filter((r) => r.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <>
      <Nav />

      <div className="resources-page">
        <h1>Community Resources</h1>

        <div className="resources-filters">
          <label htmlFor="category">Filter by Category:</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="resources-grid">
          {filteredResources.map((resource, index) => (
            <Resource key={index} {...resource} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResourcesPage;
