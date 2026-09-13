import React from 'react';
import { FiStar } from 'react-icons/fi';

const Stars = ({ rating = 0, max = 5, size = 14 }) => (
  <div className="stars">
    {Array.from({ length: max }, (_, i) => (
      <FiStar
        key={i}
        size={size}
        className={`star ${i < Math.round(rating) ? 'filled' : ''}`}
        style={{ fill: i < Math.round(rating) ? '#f59e0b' : 'none', color: i < Math.round(rating) ? '#f59e0b' : 'var(--gray-300)' }}
      />
    ))}
  </div>
);

export default Stars;
