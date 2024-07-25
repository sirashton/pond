// AnimationContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AnimationContext = createContext();

export const AnimationProvider = ({ children }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const animate = () => {
      setFrame(frame => frame + 1);
    //   console.log('Frame:', frame); // log the frame number
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <AnimationContext.Provider value={frame}>
      {children}
    </AnimationContext.Provider>
  );
};