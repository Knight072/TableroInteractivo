import { useRef, useEffect } from 'react';
import p5 from 'p5';

function App() {
  const sketch = (p) => {
    p.setup = () => {
      p.createCanvas(700, 410);
    }

    p.draw = () => {
      if (p.mouseIsPressed) {
        p.fill(0, 0, 0);
        p.ellipse(p.mouseX, p.mouseY, 20, 20);
      } else {
        p.fill(255, 255, 255);
      }
    }
  };

  const containerRef = useRef();

  useEffect(() => {
    new p5(sketch, containerRef.current);
  }, []);

  return (
    <div>
      <div ref={containerRef}></div>
    </div>
  );
}

export default App;

