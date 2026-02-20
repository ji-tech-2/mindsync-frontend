import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * FeatureIcon Component
 * Renders a Font Awesome icon for a wellness feature.
 *
 * @param {object} props
 * @param {object} props.icon - Font Awesome icon object (e.g. from getFeatureIcon)
 * @param {string} [props.className] - Additional CSS class names
 */
const FeatureIcon = ({ icon, className = '', ...props }) => {
  if (!icon) return null;
  return <FontAwesomeIcon icon={icon} className={className} {...props} />;
};

export default FeatureIcon;
