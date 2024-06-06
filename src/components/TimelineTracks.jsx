import useTracks from "../hooks/useTracks";
import TimelineTrack from "./TimelineTrack";

const TimelineTracks = () => {
  const { mainTrack, auxTracks } = useTracks();

  return (
    <div className="ml-[62px] top-[40px] relative">
      {mainTrack.length > 0 &&
        auxTracks.map((track, i) => (
          <TimelineTrack key={i} id={i} clips={track} />
        ))}
      <TimelineTrack id="main" clips={mainTrack} />
    </div>
  );
};

export default TimelineTracks;
