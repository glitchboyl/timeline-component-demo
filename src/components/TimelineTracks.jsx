import { Fragment } from "react";

import useTracks from "../hooks/useTracks";
import TimelineTrack from "./TimelineTrack";
import TimelineTrackGap from "./TimelineTrackGap";

const TimelineTracks = () => {
  const { mainTrack, auxTracks } = useTracks();

  return (
    <div className="ml-[62px] top-[40px] relative">
      <TimelineTrackGap i={0} />
      {auxTracks.map((track, i) => (
        <Fragment key={i}>
          <TimelineTrack id={i} clips={track} />
          <TimelineTrackGap i={i + 1} />
        </Fragment>
      ))}
      <TimelineTrack id="main" clips={mainTrack} />
    </div>
  );
};

export default TimelineTracks;
