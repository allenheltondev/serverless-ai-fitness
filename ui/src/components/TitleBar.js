import React from 'react';
import styles from '../styles/TitleBar.module.css';

const TitleBar = ({ title }) => { 

  return (
    <div className={styles.titleBar}>
      <a href="https://readysetcloud.io"><img className={styles.logo} src="https://www.readysetcloud.io/images/logo.png"></img></a>
      <p className={styles.title}>{title}</p>
      <a href="https://github.com/allenheltondev/serverless-ai-fitness" target="_blank" rel="noopener noreferrer"><img className={styles.github} src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"></img></a>
    </div>
  );
};

export default TitleBar;
