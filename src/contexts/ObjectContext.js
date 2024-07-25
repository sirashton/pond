import React, { createContext, useState } from 'react';

export const ObjectContext = createContext();

export const ObjectProvider = ({ children }) => {
  const [objects, setObjects] = useState([]);

  const addObject = (object) => {
    setObjects((prevObjects) => {
        const newObjects = [...prevObjects, object];
        console.log('New Objects:', newObjects); // log the new state
        return newObjects;
      });
  };

  return (
    <ObjectContext.Provider value={{ objects, addObject }}>
      {children}
    </ObjectContext.Provider>
  );
};