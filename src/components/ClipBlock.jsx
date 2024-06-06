import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// eslint-disable-next-line react/prop-types
const ClipBlock = ({ id, color }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, data: { color } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      className="w-[120px] h-[60px] rounded-[8px] mb-[8px]"
      style={{
        backgroundColor: color,
        ...style,
      }}
      {...attributes}
      {...listeners}
    ></div>
  );
};

export default ClipBlock;
