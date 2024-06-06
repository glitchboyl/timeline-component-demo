import { useState, useRef, useEffect } from "react";

const TimelineCursor = () => {
  const [active, setActive] = useState(false);
  const [deltaX, setDeltaX] = useState(0);
  const cursorRef = useRef(null);
  const startX = useRef(0);

  const handleMouseDown = (e) => {
    setActive(true);
    startX.current = e.pageX - deltaX;
  };

  useEffect(() => {
    if (active) {
      const handleMouseMove = (e) => {
        if (active) {
          const dX = e.pageX - startX.current;
          if (dX >= 0 && dX <= cursorRef.current.parentNode.offsetWidth - 56) {
            setDeltaX(dX);
          }
        }
      };

      const handleMouseUp = () => {
        setActive(false);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [active]);

  return (
    <div
      className="w-[12px] h-full left-[56px] top-[48px] z-[999] absolute"
      style={{
        transform: `translateX(${deltaX}px)`,
      }}
      onMouseDown={handleMouseDown}
      ref={cursorRef}
    >
      {/* copy from Capcut */}
      <svg
        className="cursor-hd-icon-Zy1flR"
        width="12"
        height="18"
        viewBox="0 0 12 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <mask id="path-1-inside-1_1578_341598" fill="white">
          <path d="M0 3C0 1.34314 1.34315 0 3 0H9C10.6569 0 12 1.34315 12 3V11.8287C12 12.7494 11.5772 13.6191 10.8531 14.1879L6 18L1.14686 14.1879C0.422795 13.6191 0 12.7494 0 11.8287V3Z"></path>
        </mask>
        <path
          className={`${active ? "fill-primary" : "fill-cursor-bg"}`}
          d="M0 3C0 1.34314 1.34315 0 3 0H9C10.6569 0 12 1.34315 12 3V11.8287C12 12.7494 11.5772 13.6191 10.8531 14.1879L6 18L1.14686 14.1879C0.422795 13.6191 0 12.7494 0 11.8287V3Z"
        ></path>
        <path
          className="fill-primary"
          d="M6 18L4.76457 19.5728L6 20.5432L7.23543 19.5728L6 18ZM1.14686 14.1879L-0.0885728 15.7607L1.14686 14.1879ZM10.8531 14.1879L12.0886 15.7607L10.8531 14.1879ZM3 2H9V-2H3V2ZM10 3V11.8287H14V3H10ZM2 11.8287V3H-2V11.8287H2ZM9.61771 12.6151L4.76457 16.4272L7.23543 19.5728L12.0886 15.7607L9.61771 12.6151ZM7.23543 16.4272L2.38228 12.6151L-0.0885728 15.7607L4.76457 19.5728L7.23543 16.4272ZM-2 11.8287C-2 13.3632 -1.29534 14.8128 -0.0885728 15.7607L2.38228 12.6151C2.14093 12.4255 2 12.1356 2 11.8287H-2ZM10 11.8287C10 12.1356 9.85907 12.4255 9.61771 12.6151L12.0886 15.7607C13.2953 14.8128 14 13.3632 14 11.8287H10ZM9 2C9.55228 2 10 2.44772 10 3H14C14 0.238577 11.7614 -2 9 -2V2ZM3 -2C0.238579 -2 -2 0.23857 -2 3H2C2 2.44771 2.44771 2 3 2V-2Z"
          fill="#090C14"
          mask="url(#path-1-inside-1_1578_341598)"
        ></path>
      </svg>
      {/* copy from Capcut */}
      <div className="w-[2px] h-full left-[5px] top-[16px] bg-primary absolute"></div>
    </div>
  );
};

export default TimelineCursor;
