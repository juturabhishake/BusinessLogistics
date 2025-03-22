import React, { useEffect, useState } from "react";
const AnimatedNumber = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);
  
    useEffect(() => {
      let start = 0;
      const duration = 1000;
      const increment = value / (duration / 30);
  
      const interval = setInterval(() => {
        start += increment;
        if (start >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 30);
  
      return () => clearInterval(interval);
    }, [value]);
  
    return <span className="text-3xl font-bold">{displayValue}</span>;
  };
  export default AnimatedNumber;