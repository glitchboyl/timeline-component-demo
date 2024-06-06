import { atom, useAtom } from "jotai";
import { cloneDeep, merge } from "lodash-es";

const tracksAtom = atom([
  [
    // { id: "test1", color: "#98d791", start: 0, end: 200 },
    // { id: "test2", color: "#6e0149", start: 300, end: 400 },
  ],
  // [{ id: "test3", color: "#dbb244", start: 200, end: 350 }],
]);

// { id, affectedIndex, delta }
const affectedTrackAtom = atom(null);

const useTracks = () => {
  const [tracks, setTracks] = useAtom(tracksAtom);
  const [affectedTrack, setAffectedTrack] = useAtom(affectedTrackAtom);

  const [mainTrack, ...auxTracks] = tracks;

  const getTrackIndex = (trackId) => (trackId === "main" ? 0 : +trackId + 1);

  const cleanAffect = (affectedTracks) => {
    if (affectedTrack) {
      const trackIndex = getTrackIndex(affectedTrack.id);
      if (trackIndex < affectedTracks.length) {
        const track = affectedTracks[trackIndex];
        for (let i = affectedTrack.affectedIndex; i < track.length; i++) {
          track[i].start -= affectedTrack.delta;
          track[i].end -= affectedTrack.delta;
        }
      }
      setAffectedTrack(null);
    }
    return affectedTracks;
  };

  const adjustTrack = (trackId, clipId, adjustment) => {
    const trackIndex = getTrackIndex(trackId);
    if (trackIndex < tracks.length) {
      const newTracks = cloneDeep(tracks);
      const track = newTracks[trackIndex];
      const clipIndex = track.findIndex((clip) => clip.id === clipId);
      if (clipIndex !== -1) {
        const originalClip = track[clipIndex];
        const adjustedClip = merge(originalClip, adjustment);
        const clipWidth = adjustedClip.end - adjustedClip.start;
        const lastClipEnd = track[clipIndex - 1]?.end || 0;
        const nextClipStart = track[clipIndex + 1]?.start;
        const nextClipEnd = track[clipIndex + 1]?.end;

        if (adjustedClip.start < lastClipEnd) {
          adjustedClip.start = lastClipEnd;
          adjustedClip.end = adjustedClip.start + clipWidth;
        } else if (
          typeof nextClipStart === "number" &&
          !Number.isNaN(nextClipStart) &&
          adjustedClip.end > nextClipStart
        ) {
          if (adjustedClip.start > nextClipStart) {
            adjustedClip.start = nextClipEnd;
            adjustedClip.end = adjustedClip.start + clipWidth;
            cleanAffect(newTracks);
          } else {
            adjustedClip.end = nextClipStart;
            adjustedClip.start = adjustedClip.end - clipWidth;
          }
        }

        track[clipIndex] = adjustedClip;

        // let delta = 0;
        // for (let i = clipIndex + 1; i < track.length; i++) {
        //   const clip = track[i];
        //   if (delta > 0) {
        //     clip.start += delta;
        //     clip.end += delta;
        //     continue;
        //   }
        //   if (adjustedClip.end > clip.start) {
        //     delta = adjustedClip.end - clip.start;
        //     clip.start += delta;
        //     clip.end += delta;
        //   }
        // }

        setTracks(newTracks);
      }
    }
  };

  const insertTrack = (trackId) => {};

  const insertClip = (trackId, clip) => {
    const trackIndex = getTrackIndex(trackId);
    if (trackIndex < tracks.length) {
      const newTracks = cloneDeep(tracks);
      const track = newTracks[trackIndex];
      let insertIndex = -1,
        delta = 0;
      const clipWidth = clip.end - clip.start;
      for (let i = 0; i < track.length; i++) {
        if (insertIndex !== -1) {
          if (delta > 0) {
            track[i].start += delta;
            track[i].end += delta;
          }
          continue;
        }
        if (clip.start < track[i].start) {
          insertIndex = i;
          const lastClipEnd = track[i - 1]?.end || 0;
          const insertGapWidth = track[i].start - lastClipEnd;
          if (clipWidth > insertGapWidth) {
            delta = clipWidth - insertGapWidth;
            clip.start = lastClipEnd;
            clip.end = clip.start + clipWidth;
          } else if (clip.end > track[i].start) {
            delta = clip.end - track[i].start;
          }
          if (delta > 0) {
            setAffectedTrack({
              id: trackId,
              affectedIndex: i,
              delta,
            });
            track[i].start += delta;
            track[i].end += delta;
          }
        }
      }
      if (insertIndex === -1) {
        insertIndex = track.length;
        const lastClipEnd = track[insertIndex - 1]?.end || 0;
        if (clip.start < lastClipEnd) {
          clip.start = lastClipEnd;
          clip.end = clip.start + clipWidth;
        }
      }
      track.splice(insertIndex, 0, clip);
      setTracks(newTracks);
    }
  };

  const destroyTrack = (trackId) => {};

  const destroyClip = (trackId, clipId) => {
    const trackIndex = getTrackIndex(trackId);
    if (trackIndex < tracks.length) {
      const newTracks = cleanAffect(cloneDeep(tracks));
      const track = newTracks[trackIndex];
      const clipIndex = track.findIndex((clip) => clip.id === clipId);
      if (clipIndex !== -1) {
        newTracks[trackIndex] = track.filter((_, i) => i !== clipIndex);
        setTracks(newTracks);
      }
    }
  };

  return {
    mainTrack,
    auxTracks,
    adjustTrack,
    insertTrack,
    insertClip,
    destroyTrack,
    destroyClip,
  };
};

export default useTracks;
