import React, { useEffect } from 'react';

/**
 * Environment Debug Component
 *
 * This component displays all environment variables for debugging purposes.
 * Shows which variables are loaded and their values.
 *
 * Usage: Import and add <EnvDebug /> to your app during development
 */
const EnvDebug = () => {
  useEffect(() => {
    console.group('🔍 Environment Variables Debug');
    console.log('All import.meta.env:', import.meta.env);
    console.log('VITE_RECEIPT_PRESIGN_URL:', import.meta.env.VITE_RECEIPT_PRESIGN_URL);
    console.log('Is undefined?', import.meta.env.VITE_RECEIPT_PRESIGN_URL === undefined);
    console.log('Is empty string?', import.meta.env.VITE_RECEIPT_PRESIGN_URL === '');
    console.log('Type:', typeof import.meta.env.VITE_RECEIPT_PRESIGN_URL);
    console.groupEnd();
  }, []);

  const envVars = import.meta.env;
  const viteVars = Object.keys(envVars).filter(key => key.startsWith('VITE_'));

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      backgroundColor: '#1a1a1a',
      color: '#00ff00',
      padding: '20px',
      fontFamily: 'monospace',
      fontSize: '12px',
      maxWidth: '500px',
      maxHeight: '300px',
      overflow: 'auto',
      borderRadius: '8px 0 0 0',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
      zIndex: 9999
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#ffff00' }}>
        🔍 Environment Debug Panel
      </h3>

      <div style={{ marginBottom: '15px' }}>
        <strong style={{ color: '#00ffff' }}>VITE Environment Variables:</strong>
        {viteVars.length === 0 ? (
          <div style={{ color: '#ff0000', marginTop: '5px' }}>
            ⚠️ No VITE_ variables found!
          </div>
        ) : (
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            {viteVars.map(key => (
              <li key={key} style={{ marginBottom: '5px' }}>
                <span style={{ color: '#ffff00' }}>{key}</span>:{' '}
                <span style={{ color: envVars[key] ? '#00ff00' : '#ff0000' }}>
                  {envVars[key] || '(empty)'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginBottom: '15px', borderTop: '1px solid #444', paddingTop: '10px' }}>
        <strong style={{ color: '#00ffff' }}>Receipt Upload Config:</strong>
        <div style={{ marginTop: '5px' }}>
          <div>
            Status: {envVars.VITE_RECEIPT_PRESIGN_URL ? (
              <span style={{ color: '#00ff00' }}>✓ Configured</span>
            ) : (
              <span style={{ color: '#ff0000' }}>✗ Not Set</span>
            )}
          </div>
          <div style={{ marginTop: '5px', wordBreak: 'break-all' }}>
            Value: <span style={{ color: '#888' }}>
              {envVars.VITE_RECEIPT_PRESIGN_URL || '(undefined)'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: '10px', color: '#888', borderTop: '1px solid #444', paddingTop: '10px' }}>
        <strong>Troubleshooting:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>Restart dev server after changing .env</li>
          <li>Ensure .env is in project root</li>
          <li>Variable must start with VITE_</li>
          <li>No quotes needed for values</li>
        </ul>
      </div>
    </div>
  );
};

export default EnvDebug;
