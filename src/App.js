import React, { useContext, useEffect } from 'react';
import { BlobProvider, BlobContext } from './contexts/BlobContext';
import { ObjectProvider, ObjectContext } from './contexts/ObjectContext';
import { AnimationProvider } from './contexts/AnimationContext';
import Blob from './components/Blob';
import Chain from './components/Chain';

const App = () => {
  return (
    <div>
      <AnimationProvider>
      <BlobProvider>
        <BlobAdder />
        <BlobDisplay />
      </BlobProvider>
      <ObjectProvider>
        <ObjectAdder />
        <ObjectDisplay />
      </ObjectProvider>
      </AnimationProvider>
    </div>
  );
};

const BlobAdder = () => {
  const { addBlob } = useContext(BlobContext);

  const createBlob = () => {
    const size = Math.random() * 50 + 50; // random size between 50 and 100
    const color = `hsl(${Math.random() * 360}, 100%, 50%)`; // random color
    const position = {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight
    }; // random position
    const direction = {
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1 }; // random direction
    addBlob({ size, color, position, direction });
  };

  return <button onClick={createBlob}>Add Blob</button>;
};

const ObjectAdder = () => {
  const { addObject } = useContext(ObjectContext);

  const createObject = () => {
    const numJoints = 50;
    const linkDistance = 10;
    const baseBearing = 2*Math.PI * Math.random();
    const idealAngle = 0.2*Math.PI * Math.random();
    addObject({ numJoints, linkDistance, baseBearing, idealAngle });
  }

  return <button onClick={createObject}>Add Object</button>;
}

const BlobDisplay = () => {
  const { blobs, frame } = useContext(BlobContext);

  useEffect(() => {
    console.log('Rendering BlobDisplay with blobs:', blobs); // log a message each time blobs changes
  }, [blobs]);

  return (
    <div style={{ zIndex: 1}}>
      {blobs.map((blob, index) => (
        <Blob frame={frame} key={index} size={blob.size} color={blob.color} position={blob.position} direction={blob.direction}/>
      ))}
    </div>
  );
};

const ObjectDisplay = () => {
  const { objects } = useContext(ObjectContext);

  console.log('Rendering ObjectDisplay with objects:', objects); // log a message each time the component renders

  return (
    <div style={{ zIndex: 1}}>
      {objects.map((object, index) => (
        <Chain key={index} numJoints={object.numJoints} linkDistance={object.linkDistance} baseBearing={object.baseBearing} idealAngle={object.idealAngle} />
      ))}
    </div>
  );
}

export default App;