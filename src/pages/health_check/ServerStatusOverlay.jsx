import React, { useState, useEffect } from 'react';

const ServerStatusOverlay = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkServer = async () => {
      try {
        // Replace with your actual backend URL from .env
        const response = await fetch("http://localhost:5000/health");
        if (response.ok) {
          setIsReady(true);
        } else {
          throw new Error("Server not ready");
        }
      } catch (err) {
        console.log("Server is still waking up...");
        // Retry every 3 seconds
        setTimeout(checkServer, 3000);
      }
    };

    checkServer();
  }, []);

  if (!isReady) {
    return (
      <div style={overlayStyle}>
        <div className="loader-container">
          <h2>Waking up the server...</h2>
          <p>This usually takes 30-60 seconds on free hosting plans.</p>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return children;
};

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  backgroundColor: '#1a1a1a', color: 'white', display: 'flex',
  flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
  zIndex: 9999, textAlign: 'center'
};

export default ServerStatusOverlay;