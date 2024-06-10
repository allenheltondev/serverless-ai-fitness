import React, { useState } from 'react';
import { Text, Heading } from '@aws-amplify/ui-react';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    position: 'relative',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    width: '100%',
    zIndex: 1001,

  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    cursor: 'pointer',
    fontSize: '24px',
    color: 'black'
  }
};

const Popup = ({ title, description, onClose }) => {
  const handleClose = () => {
    onClose();
  };

  const handleOutsideClick = (event) => {
    if (event.target.id === "overlay-background") {
      onClose();
    }
  };

  return (
    <div id="overlay-background" style={styles.overlay} onClick={handleOutsideClick}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <span style={styles.closeButton} onClick={handleClose}>&times;</span>
        <Heading level={4}>{title}</Heading>
        <Text marginTop={"medium"}>{description}</Text>
      </div>
    </div>
  );
};

export default Popup;
