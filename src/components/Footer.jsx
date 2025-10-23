import { useState, useEffect } from 'react';
import styles from './Footer.module.css';

function Footer() {
  const [decodedEmail, setDecodedEmail] = useState('');

  useEffect(() => {
    // Simple email obfuscation - decode on client side
    const encodedEmail = 'YWRtaW5AZXhwbG9yZWpjcHMuY29t'; // base64 encoded: admin@explorejcps.com
    try {
      const decoded = atob(encodedEmail);
      setDecodedEmail(decoded);
    } catch {
      // Fallback if decoding fails
      setDecodedEmail('admin@explorejcps.com');
    }
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLine}>
          Made with <span className={styles.heart}>♥</span> in Louisville, KY
        </div>
        <div className={styles.footerLine}>
          www.ExploreJCPS.com is a tool created by a JCPS parent to help JCPS families better understand their school choices.
        </div>
        <div className={styles.footerLine}>
          For questions or feedback please email{' '}
          <a 
            href={`mailto:${decodedEmail}`}
            className={styles.footerEmail}
            aria-label={`Email ${decodedEmail}`}
          >
            {decodedEmail}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
