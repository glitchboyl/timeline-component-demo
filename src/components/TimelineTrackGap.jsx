import { useDroppable } from "@dnd-kit/core";

// eslint-disable-next-line react/prop-types
const TimelineTrackGap = ({ i }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `gap-${i}`,
    data: {
      gap: true,
      i,
    },
  });

  return (
    <div ref={setNodeRef} className="h-[8px] relative">
      {isOver && (
        <div className="w-full h-[1px] top-[50%] mt-[-0.5px] bg-active absolute"></div>
      )}
    </div>
  );
};

export default TimelineTrackGap;
