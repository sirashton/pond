import React, { useContext } from 'react';
import { BlobProvider, BlobContext } from './contexts/BlobContext';
import Blob from './components/Blob';

const App = () => {
  return (
    <BlobProvider>
      <BlobAdder />
      <BlobDisplay />
    </BlobProvider>
  );
};

const BlobAdder = () => {
  const { addBlob } = useContext(BlobContext);

  const createBlob = () => {
    const size = Math.random() * 50 + 50; // random size between 50 and 100
    const color = `hsl(${Math.random() * 360}, 100%, 50%)`; // random color
    const position = { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }; // random position
    const direction = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }; // random direction
    addBlob({ size, color, position, direction });
  };

  return <button onClick={createBlob}>Add Blob</button>;
};

const BlobDisplay = () => {
  const { blobs } = useContext(BlobContext);

  console.log('Rendering BlobDisplay with blobs:', blobs); // log a message each time the component renders

  return (
    <div style={{ zIndex: 1}}>
      {blobs.map((blob, index) => (
        <Blob key={index} size={blob.size} color={blob.color} position={blob.position} direction={blob.direction}/>
      ))}
    </div>
  );
};

export default App;