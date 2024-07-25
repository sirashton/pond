// A component that creates a chain of points that follow or get pushed from a base point.
import React from 'react';

const defaultRenderer = ({ joints }) => (
    <svg style={{position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none'}} viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}>
        {joints.map((joint, index) => (
            <circle key={index} cx={joint.x} cy={joint.y} r={3} fill="black" />
        ))}
    </svg>
);

const Chain = ({
    numJoints = 5,
    baseBearing = 0,
    linkDistance = 10, // single value or an array of values
    minAngle = -2 * Math.PI, // single value or an array of values
    maxAngle = 2 * Math.PI, // single value or an array of values
    idealAngle = 0, // single value or an array of values
    stiffness = 1.0, // single value or an array of values
    baseCoord = { x: 200, y: 100 },
    renderer = defaultRenderer,
    joints,
  }) => {
    console.log('Chain called with:', numJoints, baseBearing, linkDistance, minAngle, maxAngle, idealAngle, stiffness, baseCoord, renderer, joints);
    // Check the length of input arrays and throw an error if they are not the same
    if (Array.isArray(linkDistance) && linkDistance.length !== numJoints) {
      throw new Error('The length of linkDistance array must be the same as numJoints');
    }
    if (Array.isArray(minAngle) && minAngle.length !== numJoints) {
      throw new Error('The length of minAngle array must be the same as numJoints');
    }
    if (Array.isArray(maxAngle) && maxAngle.length !== numJoints) {
      throw new Error('The length of maxAngle array must be the same as numJoints');
    }
    if (Array.isArray(idealAngle) && idealAngle.length !== numJoints) {
      throw new Error('The length of idealAngle array must be the same as numJoints');
    }
    if (Array.isArray(stiffness) && stiffness.length !== numJoints) {
      throw new Error('The length of stiffness array must be the same as numJoints');
    }

    // Calculate the cumulative initial bearings
    let cumulativeInitialBearings = [baseBearing];
    if (Array.isArray(idealAngle)) {
        cumulativeInitialBearings = idealAngle.reduce((acc, curr, index) => {
        acc.push((acc[index - 1] || 0) + curr);
        return acc;
        }, []);
    }
    else {
        cumulativeInitialBearings = Array.from({ length: numJoints }, (_, index) => index * idealAngle);
    }

    // Initialize the joints array if it is not provided
    if (!joints) {
        joints = [];
        for (let index = 0; index < numJoints; index++) {
        const joint = {
            minAngle: Array.isArray(minAngle) ? minAngle[index] : minAngle,
            maxAngle: Array.isArray(maxAngle) ? maxAngle[index] : maxAngle,
            idealAngle: Array.isArray(idealAngle) ? idealAngle[index] : idealAngle,
            stiffness: Array.isArray(stiffness) ? stiffness[index] : stiffness,
            bearing: index === 0 ? baseBearing : cumulativeInitialBearings[index],
            x: index === 0 ? baseCoord.x : joints[index - 1].x + (Array.isArray(linkDistance) ? linkDistance[index] : linkDistance) * Math.cos(cumulativeInitialBearings[index]),
            y: index === 0 ? baseCoord.y : joints[index - 1].y + (Array.isArray(linkDistance) ? linkDistance[index] : linkDistance) * Math.sin(cumulativeInitialBearings[index]),
            linkDistance: Array.isArray(linkDistance) ? linkDistance[index] : linkDistance,
        };
        joints.push(joint);
        }
    }
    return renderer({ joints });
};

export default Chain;