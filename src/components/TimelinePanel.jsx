import TimelineRuler from "./TimelineRuler";
import TimelineCursor from "./TimelineCursor";
import TimelineTracks from "./TimelineTracks";

import useTracks from "../hooks/useTracks";

const TimelinePanel = () => {
  const { mainTrack } = useTracks();
  return (
    <div className="flex-grow pt-[48px] relative">
      <TimelineRuler />
      {mainTrack.some((clip) => !clip.virtual) && <TimelineCursor />}
      <TimelineTracks />
    </div>
  );
};

export default TimelinePanel;
