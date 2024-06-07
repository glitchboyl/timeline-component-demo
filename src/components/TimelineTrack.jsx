import { useDroppable } from "@dnd-kit/core";
import TimelineClip from "./TimelineClip";

// eslint-disable-next-line react/prop-types
const TimelineTrack = ({ id, clips = [] }) => {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      track: true,
    },
  });

  const isMainTrack = id === "main";

  return (
    <div
      ref={setNodeRef}
      className={`${
        isMainTrack ? "h-[48px]" : "h-[36px]"
      } rounded-[8px] bg-track-bg relative text-[12px] text-tertiary/50 text-center leading-[48px] cursor-default`}
    >
      {isMainTrack && clips.length === 0
        ? "Drag and drop clip here"
        : clips.map((clip) => (
            <TimelineClip key={clip.id} clip={{ ...clip, trackId: id }} />
          ))}
    </div>
  );
};

export default TimelineTrack;
