import React from 'react';
import CollapsibleCard from '@/components/CollapsibleCard';
import { getFeatureDisplayName } from '@/utils/featureNames';
import styles from './AdviceFactor.module.css';

const AdviceFactor = ({ factorKey, factorData }) => {
  return (
    <CollapsibleCard title={getFeatureDisplayName(factorKey)}>
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
              {factorData.references.map((ref, idx) => (
                <li key={idx} className={styles.refItem}>
                  <a
                    href={typeof ref === 'object' ? ref.url : ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.refLink}
                  >
                    Resource {idx + 1}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
};

export default AdviceFactor;
