import React, { createContext, useState, useEffect } from 'react';

export const BlobContext = createContext();

export const BlobProvider = ({ children }) => {
  const [blobs, setBlobs] = useState([]);
  const [frame, setFrame] = useState(0);

  const addBlob = (blob) => {
    setBlobs((prevBlobs) => {
        const newBlobs = [...prevBlobs, blob];
        console.log('New blobs:', newBlobs); // log the new state
        return newBlobs;
      });
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => setFrame(frame + 1));
    return () => cancelAnimationFrame(id);
  }, [frame]);

  return (
    <BlobContext.Provider value={{ blobs, addBlob }}>
      {children}
    </BlobContext.Provider>
  );
};