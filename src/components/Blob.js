import React, { useEffect, useRef, useState } from 'react';
import { spline } from '@georgedoescode/spline';

const Blob = ({ size, color, position, direction, spineLength = 10, spineDistance = 10 }) => {
    console.log('Rendering Blob with size:', size, 'color:', color, 'position:', position, 'direction:', direction);
    const ref = useRef();
    const pointsRef = useRef(createPoints(size, position));
    const directionRef = useRef(direction);
    // Set the default target destination to 100 unit in front of the head
    const destinationRef = useRef({ x: position.x + direction.x * 100, y: position.y + direction.y * 100 });
    
    // eslint-disable-next-line no-unused-vars
    const [renderCount, setRenderCount] = useState(0);

    // Create spine points behind the head
    const initialSpinePoints = Array.from({ length: spineLength }, (_, i) => ({
        x: position.x - direction.x * (i + 1) * spineDistance,
        y: position.y - direction.y * (i + 1) * spineDistance,
    }));
    const spinePointsRef = useRef(initialSpinePoints);

    // Define a variable to store the time when the cursor last moved
    const lastCursorMoveTimeRef = useRef(Date.now());

    // A function that takes in the current direction and the desired Direction and returns the new direction
    // It limits the angle change to maxAngleChange
    // And addes a sinusoidal wiggle to the direction to mimic the movement of a fish
    function updateDirection(currentDirection, desiredDirection, maxAngleChange) {
        // add a sinusoidal wiggle to the desired direction, to mimic the movement of a fish
        const wiggleDuration = 2; // in seconds
        // Set max wiggle angle to 30 degrees in radians
        const maxWiggleAngle = 20 * Math.PI / 180;
        const offSet = Math.sin(Date.now() / (wiggleDuration * 1000) * Math.PI * 2) * maxWiggleAngle;

        const desiredBearing = Math.atan2(desiredDirection.y, desiredDirection.x) +  offSet;
        const currentBearing = Math.atan2(currentDirection.y, currentDirection.x);
        let desiredBearingChange = desiredBearing - currentBearing;

        // Adjust the bearing change to the correct range (-π to π)
        if (desiredBearingChange > Math.PI) {
            desiredBearingChange -= 2 * Math.PI;
        } else if (desiredBearingChange < -Math.PI) {
            desiredBearingChange += 2 * Math.PI;
        }

        const limitedBearingChange = Math.min(maxAngleChange, Math.abs(desiredBearingChange)) * Math.sign(desiredBearingChange);
        const newBearing = currentBearing + limitedBearingChange;
        const normalizedBearing = (newBearing + 2 * Math.PI) % (2 * Math.PI);
        const newDirection = {
            x: Math.cos(normalizedBearing),
            y: Math.sin(normalizedBearing)
        };
        return newDirection;
    }
    useEffect(() => {
        function handleMouseMove(event) {
            // Update the destination to the mouse position
            destinationRef.current = { x: event.clientX, y: event.clientY };

            lastCursorMoveTimeRef.current = Date.now();
            
        }
        window.addEventListener('mousemove', handleMouseMove);
    
        // Clean up event listener on unmount
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
      function animate() {
        // Pulsate the blob
        for (let i = 0; i < pointsRef.current.length; i++) {
            const point = pointsRef.current[i];
            point.y = point.originY + Math.sin(point.angel) * 20;
            point.angel += point.speed;
        }
        // Update SVG path
        ref.current.setAttribute('d', spline(pointsRef.current, 1, true));

        const idleTimeThreshold = 5000; // miliseconds

        const distanceHeadToDestination = Math.sqrt((destinationRef.current.x - spinePointsRef.current[0].x) ** 2 + (destinationRef.current.y - spinePointsRef.current[0].y) ** 2);
        if (distanceHeadToDestination < 20) {
            // If the head is close enough to the destination, generate a new random destination
            destinationRef.current = {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight
            };
        }
        else {
            // Check if the cursor hasn't moved for more than a certain amount of time
            if (Date.now() - lastCursorMoveTimeRef.current > idleTimeThreshold) {
                // Generate a random chance
                const randomChance = Math.random();

                // If the random chance is less than a certain threshold, change the destination point
                const changeDestinationThreshold = 0.005;
                if (randomChance < changeDestinationThreshold) {
                    destinationRef.current = {
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight
                    };
                }
            }
        }

        // Calculate desired direction
        const dx = destinationRef.current.x - spinePointsRef.current[0].x;
        const dy = destinationRef.current.y - spinePointsRef.current[0].y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const desiredDirection = {
            x: dx / length,
            y: dy / length
        };

        // Update the direction
        directionRef.current = updateDirection(
            directionRef.current,
            desiredDirection,
            0.05
        );

        // Move the head point 1 unit in the direction of the direction vector
        spinePointsRef.current = spinePointsRef.current.map((point, i) => {
            if (i === 0) {
                return {
                    ...point,
                    x: point.x + directionRef.current.x,
                    y: point.y + directionRef.current.y
                };
            }
            return point;
        });

        // Initialize a cumulative adjustment
        let cumulativeAdjustment = { x: 0, y: 0 };

        // Move the rest of the spine points along the direction to the point in front of them. To a distance of spineDistance
        spinePointsRef.current = spinePointsRef.current.map((point, i) => {
            if (i === 0) {
                // Reset the cumulative adjustment for each new frame
                cumulativeAdjustment = { x: 0, y: 0 };
                return point; // Skip the head point
            }

            // Add the cumulative adjustment to the current point
            point = {
                x: point.x + cumulativeAdjustment.x,
                y: point.y + cumulativeAdjustment.y
            };
        
            const dx = spinePointsRef.current[i - 1].x - point.x;
            const dy = spinePointsRef.current[i - 1].y - point.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const thisPointIdealDirection = { x: dx / length, y: dy / length };
        
            var dxAhead = directionRef.current.x;
            var dyAhead = directionRef.current.y;
            if (i > 1) {
                dxAhead = spinePointsRef.current[i - 2].x - spinePointsRef.current[i - 1].x;
                dyAhead = spinePointsRef.current[i - 2].y - spinePointsRef.current[i - 1].y;
            }
            const directionAhead = { x: dxAhead, y: dyAhead };
            const maxJointAngle = 0.6;

            var thisPointIdealBearing = Math.atan2(thisPointIdealDirection.y, thisPointIdealDirection.x);
            var directionAheadBearing = Math.atan2(directionAhead.y, directionAhead.x);
            var idealJointAngle = thisPointIdealBearing - directionAheadBearing;
            if (idealJointAngle > Math.PI) {
                idealJointAngle -= 2 * Math.PI;
            } else if (idealJointAngle < -Math.PI) {
                idealJointAngle += 2 * Math.PI;
            }
            var limitedJointAngle = Math.min(maxJointAngle, Math.abs(idealJointAngle)) * Math.sign(idealJointAngle);
            var thisPointLimitedBearing = directionAheadBearing + limitedJointAngle;
            var thisPointLimitedDirection = {
                x: Math.cos(thisPointLimitedBearing),
                y: Math.sin(thisPointLimitedBearing)
            };
            // If the point needs moving to the side to avoid a joint angle greater than maxJointAngle
            // we also need to update all the points behind this point with the same offset

            const idealPointLocation = {
                x: spinePointsRef.current[i - 1].x - thisPointIdealDirection.x * spineDistance,
                y: spinePointsRef.current[i - 1].y - thisPointIdealDirection.y * spineDistance
            };
            const limitedPointLocation = {
                x: spinePointsRef.current[i - 1].x - thisPointLimitedDirection.x * spineDistance,
                y: spinePointsRef.current[i - 1].y - thisPointLimitedDirection.y * spineDistance
            };

            const pointAdjustment = {
                x: limitedPointLocation.x - idealPointLocation.x,
                y: limitedPointLocation.y - idealPointLocation.y
            };

            // Add the point adjustment to the cumulative adjustment
            cumulativeAdjustment.x += pointAdjustment.x;
            cumulativeAdjustment.y += pointAdjustment.y;

            return {
                ...point,
                x: limitedPointLocation.x,
                y: limitedPointLocation.y
            };
            
        });

        // Trigger a re-render
        setRenderCount(renderCount => renderCount + 1);

        requestAnimationFrame(animate);
      }
  
      animate();
    }, [spineDistance]);

    return (
        <svg style={{position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none'}} viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}>
            <path fill="none" d={spline(pointsRef.current, 1, true)} ref={ref} />
            {spinePointsRef.current.map((point, index) => (
                <circle id={`spinePoint${index}`} key={index} cx={point.x} cy={point.y} r={5} fill={color} />
            ))}
            {/* Add a square for the current destination point */}
            <rect x={destinationRef.current.x - 5} y={destinationRef.current.y - 5} width={10} height={10} fill="none" />
            {/* Add a line for the current ideal direction */}
            <line x1={spinePointsRef.current[0].x} y1={spinePointsRef.current[0].y} x2={spinePointsRef.current[0].x + directionRef.current.x * 100} y2={spinePointsRef.current[0].y + directionRef.current.y * 100} stroke="none" strokeWidth={2} />
        </svg>
    );
};

function createPoints(size, position) {
    const points = [];
    const numPoints = 6;
    const angleStep = (Math.PI * 2) / numPoints;
    const rad = size / 2; // Use size parameter to determine radius
  
    for (let i = 1; i <= numPoints; i++) {
      const theta = i * angleStep;
      const x = position.x + Math.cos(theta) * rad; // Use position parameter to determine center
      const y = position.y + Math.sin(theta) * rad;

      points.push({
        x: x,
        y: y,
        originX: x,
        originY: y,
        angel: Math.random() * (Math.PI * 2), // random start angle
        speed: 0.01 + Math.random() * 0.04 // random speed
      });
    }
  
    return points;
  }

export default Blob;