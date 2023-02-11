import React, { useState } from 'react';
import './spinningWheel.css';

interface Segment {
  color: string;
  label: string;
  chance: number;
}

interface Props {
  segments: Segment[];
}

const SpinningWheel: React.FC<Props> = ({ segments }) => {
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

  const handleSpin = () => {
    // Generate a random number between 0 and the total sum of chances
    const randomNumber = Math.floor(Math.random() * segments.reduce((sum, segment) => sum + segment.chance, 0));
  
    // Find the winning segment based on the random number
    let currentChance = 0;
    const winningSegment = segments.find(segment => {
      currentChance += segment.chance;
      return currentChance > randomNumber;
    });
  
    // Set the winning segment as the selected segment
    if (winningSegment) {
      setSelectedSegment(winningSegment);
    }
  };
  

  return (
    <div className="spinning-wheel">
      <div className="spinning-wheel-segments">
        {segments && segments.map(segment => (
          <div
            className={`spinning-wheel-segment ${selectedSegment === segment ? 'selected' : ''}`}
            key={segment.label}
            style={{ backgroundColor: segment.color }}
          >
            {segment.label}
          </div>
        ))}
      </div>
      <button className="spinning-wheel-button" onClick={handleSpin}>
        Spin
      </button>
    </div>
  );
};

export default SpinningWheel;