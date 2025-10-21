"use client";

import React from "react";

interface SeoHeadingsProps {
  h1: string;
  h2?: string[];
  h3?: string[];
  className?: string;
}

const SeoHeadings: React.FC<SeoHeadingsProps> = ({ 
  h1, 
  h2 = [], 
  h3 = [], 
  className = "" 
}) => {
  return (
    <div className={`seo-headings ${className}`}>
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        {h1}
      </h1>
      
      {h2.map((heading, index) => (
        <h2 key={index} className="text-2xl font-semibold text-gray-800 mb-4">
          {heading}
        </h2>
      ))}
      
      {h3.map((heading, index) => (
        <h3 key={index} className="text-xl font-medium text-gray-700 mb-3">
          {heading}
        </h3>
      ))}
    </div>
  );
};

export default SeoHeadings;
