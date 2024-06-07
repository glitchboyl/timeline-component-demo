import TimelineRuler from "./TimelineRuler";
import TimelineCursor from "./TimelineCursor";
import TimelineTracks from "./TimelineTracks";

import useTracks from "../hooks/useTracks";

const TimelinePanel = () => {
  const { mainTrack, auxTracks } = useTracks();
  return (
    <div className="flex-grow pt-[48px] relative">
      <TimelineRuler />
      {(mainTrack.some((clip) => !clip.virtual) ||
        auxTracks.some((track) => track.some((clip) => !clip.virtual))) && (
        <TimelineCursor />
      )}
      <TimelineTracks />
    </div>
  );
};

export default TimelinePanel;
