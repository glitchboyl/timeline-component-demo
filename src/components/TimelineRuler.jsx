import { useState, useRef, useEffect } from "react";
import { debounce } from "lodash-es";

const TimelineRuler = () => {
  const [rulerWidth, setRulerWidth] = useState(0);
  const rulerRef = useRef(null);

  useEffect(() => {
    const handleWidthChange = debounce(() => {
      if (rulerRef.current.offsetWidth > 56) {
        setRulerWidth(rulerRef.current.offsetWidth - 56);
      }
    }, 100);

    const resizeObserver = new ResizeObserver(() => {
      handleWidthChange();
    });

    if (rulerRef.current) {
      resizeObserver.observe(rulerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      handleWidthChange.cancel();
    };
  }, []);

  return (
    <div
      className="border-t-[1px] border-solid border-t-border/10 relative"
      ref={rulerRef}
    >
      {Array(Math.floor(rulerWidth / 20))
        .fill(null)
        .map((_, i) => (
          <div
            key={i}
            style={{
              height: i % 10 === 0 ? 16 : 4,
              left: 56 + 6 + i * 20,
            }}
            className="w-[1px] top-[4px] absolute bg-border/10"
          ></div>
        ))}
    </div>
  );
};

export default TimelineRuler;
