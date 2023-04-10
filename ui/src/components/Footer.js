import React from 'react';
import styles from '../styles/Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <p className={styles.copyright}>
        | &copy; {currentYear} <i>Ready, Set, Cloud!</i> | All rights reserved |
      </p>
    </footer>
  );
};

export default Footer;
