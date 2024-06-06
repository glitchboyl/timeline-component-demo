import { useDroppable } from "@dnd-kit/core";

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
      } rounded-[8px] mb-[8px] bg-track-bg relative text-[12px] text-tertiary/50 text-center leading-[48px] cursor-default`}
    >
      {isMainTrack && clips.length === 0
        ? "Drag and drop clip here"
        : clips.map((clip) => (
            <div
              key={clip.id}
              style={{
                backgroundColor: !clip.virtual ? clip.color : "",
                width: clip.end - clip.start,
                left: clip.start,
              }}
              className={`h-full rounded-[8px] absolute ${
                clip.virtual
                  ? "border-dashed border-2 bg-active/40 border-active"
                  : ""
              }`}
            ></div>
          ))}
    </div>
  );
};

export default TimelineTrack;
