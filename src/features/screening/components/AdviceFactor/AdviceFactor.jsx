import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import CollapsibleCard from '@/components/CollapsibleCard';
import { getFeatureDisplayName, getFeatureIcon } from '@/utils/featureNames';
import styles from './AdviceFactor.module.css';

const AdviceFactor = ({ factorKey, factorData }) => {
  const displayName = getFeatureDisplayName(factorKey);
  const icon = getFeatureIcon(displayName);
  return (
    <CollapsibleCard title={displayName} icon={icon}>
      <div className={styles.content}>
        <ul className={styles.list}>
          {factorData.advices.map((item, index) => (
            <li key={index} className={styles.listItem}>
              {item}
            </li>
          ))}
        </ul>

        {factorData.references && factorData.references.length > 0 && (
          <div className={styles.referenceSection}>
            <h4 className={styles.refTitle}>References:</h4>
            <ul className={styles.refList}>
              {factorData.references.map((ref, idx) => {
                const href = typeof ref === 'object' ? ref.url : ref;
                let label;
                try {
                  label = new URL(href).hostname.replace(/^www\./, '');
                } catch {
                  label = `Resource ${idx + 1}`;
                }
                return (
                  <li key={idx} className={styles.refItem}>
                    <FontAwesomeIcon
                      icon={faLink}
                      className={styles.refIcon}
                      aria-hidden="true"
                    />
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.refLink}
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
};

export default AdviceFactor;
