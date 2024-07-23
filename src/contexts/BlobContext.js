import React, { createContext, useState } from 'react';

export const BlobContext = createContext();

export const BlobProvider = ({ children }) => {
  const [blobs, setBlobs] = useState([]);

  const addBlob = (blob) => {
    setBlobs((prevBlobs) => {
        const newBlobs = [...prevBlobs, blob];
        console.log('New blobs:', newBlobs); // log the new state
        return newBlobs;
      });
  };

  return (
    <BlobContext.Provider value={{ blobs, addBlob }}>
      {children}
    </BlobContext.Provider>
  );
};