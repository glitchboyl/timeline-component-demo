/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import useTracks from "../hooks/useTracks";

const TimelineClip = ({ clip }) => {
  const [isResizing, setIsResizing] = useState(null);
  const { adjust } = useTracks();
  const startX = useRef(0);

  const leftSideResizeRef = useRef(null);
  const rightSideResizeRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: clip.id, data: { clip } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isResizing) {
      const handleMouseMove = (e) => {
        if (isResizing) {
          const dX =
            isResizing === "left"
              ? startX.current - e.pageX
              : e.pageX - startX.current;
          const adjustedClip = { id: clip.id, isResizing };
          if (isResizing === "left") {
            adjustedClip.start = Math.min(clip.start - dX, clip.end - 20);
          } else {
            adjustedClip.end = Math.max(clip.end + dX, clip.start + 20);
          }
          adjust("ADJUST_CLIP", {
            trackId: clip.trackId,
            clip: adjustedClip,
          });
        }
      };

      const handleMouseUp = () => {
        setIsResizing(null);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing]);

  if (clip.virtual) {
    return (
      <div
        ref={setNodeRef}
        style={{
          width: clip.end - clip.start,
          left: clip.start,
        }}
        className="h-full rounded-[8px] absolute border-dashed border-2 bg-active/40 border-active"
      ></div>
    );
  }

  const handleMouseDown = (e) => {
    setIsResizing(
      e.currentTarget === leftSideResizeRef.current
        ? "left"
        : e.currentTarget === rightSideResizeRef.current
        ? "right"
        : null
    );
    startX.current = e.pageX;
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        backgroundColor: !clip.virtual ? clip.color : "",
        width: clip.end - clip.start,
        left: clip.start,
        ...style,
      }}
      className="h-full rounded-[8px] absolute"
      {...attributes}
      {...listeners}
    >
      <div
        ref={leftSideResizeRef}
        className="cursor-col-resize h-full w-[5px] left-0 absolute z-[99]"
        onMouseDown={handleMouseDown}
        onPointerDown={(event) => event.stopPropagation()}
      ></div>
      <div
        ref={rightSideResizeRef}
        className="cursor-col-resize h-full w-[5px] right-0 absolute"
        onMouseDown={handleMouseDown}
        onPointerDown={(event) => event.stopPropagation()}
      ></div>
    </div>
  );
};

export default TimelineClip;
