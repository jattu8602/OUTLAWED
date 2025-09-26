import React from 'react'

const dotStyle = {
  display: 'inline-block',
  width: 16,
  height: 16,
  margin: '0 4px',
  borderRadius: '50%',
  background: '#fcf2e8',
  animation: 'bounce 1s infinite alternate',
}

const Loader = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#212121',
      zIndex: 9999,
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
    }}
  >
    <style>{`
      @keyframes bounce {
        0% { transform: translateY(0); }
        100% { transform: translateY(-24px); }
      }
    `}</style>
    <span style={{ ...dotStyle, animationDelay: '0s' }} />
    <span
      style={{ ...dotStyle, background: '#f15bb5', animationDelay: '0.2s' }}
    />
    <span
      style={{ ...dotStyle, background: '#fee440', animationDelay: '0.4s' }}
    />
  </div>
)

export default Loader
