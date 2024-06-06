import Ruler from "./Ruler";
import Cursor from "./Cursor";

const TimelinePanel = () => {
  return (
    <div className="flex-grow pt-[48px] relative">
      <Ruler />
      <Cursor />
    </div>
  );
};

export default TimelinePanel;
