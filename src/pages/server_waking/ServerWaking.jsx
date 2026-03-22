// RenderLoader.jsx
import React from 'react';

const RenderLoader = () => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.text}>Your service is spinning up...</p>
      <p style={styles.subtext}>This usually takes a few seconds on the free tier.</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#ffffff',
    fontFamily: 'sans-serif'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #4a5568', // Render-ish slate gray
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  text: { marginTop: '20px', fontSize: '18px', color: '#1a202c', fontWeight: '500' },
  subtext: { marginTop: '8px', fontSize: '14px', color: '#718096' }
};

// Add this to your index.css to make the spinner move:
/* @keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
*/

export default RenderLoader;