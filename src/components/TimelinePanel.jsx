import TimelineRuler from "./TimelineRuler";
import TimelineCursor from "./TimelineCursor";

const TimelinePanel = () => {
  return (
    <div className="flex-grow pt-[48px] relative">
      <TimelineRuler />
      <TimelineCursor />
    </div>
  );
};

export default TimelinePanel;
