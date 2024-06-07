import { atom, useAtom } from "jotai";
import { cloneDeep, merge } from "lodash-es";

const tracksAtom = atom([
  [
    // { id: "test1", color: "#98d791", start: 0, end: 200 },
    // { id: "test2", color: "#6e0149", start: 300, end: 400 },
  ],
  // [{ id: "test3", color: "#dbb244", start: 200, end: 350 }],
]);

let unmountedClip = null;

let rollbackTracks = null;

const useTracks = () => {
  const [tracks, setTracks] = useAtom(tracksAtom);

  const [mainTrack, ...auxTracks] = tracks;

  const getTrackIndex = (trackId) => (trackId === "main" ? 0 : +trackId + 1);

  const adjust = (type, payload) => {
    const newTracks = cloneDeep(tracks);
    // insert track
    if (type === "INSERT_TRACK") {
      const { insertIndex, clip } = payload;
      if (!isNaN(insertIndex)) {
        if (typeof clip.trackId !== "undefined") {
          const originalTrackIndex = getTrackIndex(clip.trackId);
          const originalTrack = newTracks[originalTrackIndex];
          const clipIndex = originalTrack.findIndex(({ id }) => id === clip.id);
          originalTrack.splice(clipIndex, 1);
          if (originalTrack.length === 0 && clip.trackId !== "main") {
            newTracks.splice(originalTrackIndex, 1);
          }
        }
        delete clip.trackId;
        delete clip.virtual;
        newTracks.splice(insertIndex + 1, 0, [clip]);
        setTracks(newTracks);
      }
    }
    // rollback
    else if (type === "ROLLBACK") {
      if (rollbackTracks !== null) {
        setTracks(rollbackTracks);
        rollbackTracks = null;
      }
    }
    // turn virtual clip into real clip
    else if (type === "INSERT_CLIP") {
      if (unmountedClip) {
        newTracks[unmountedClip.trackIndex][
          unmountedClip.clipIndex
        ].virtual = false;
        unmountedClip = null;
        rollbackTracks = newTracks;
        setTracks(newTracks);
      }
    } else {
      const { trackId, clip } = payload;
      const trackIndex = getTrackIndex(trackId);
      if (!isNaN(trackIndex)) {
        const track = newTracks[trackIndex];

        // insert virtual clip
        if (type === "INSERT_VIRTUAL_CLIP") {
          if (unmountedClip?.id === clip.id) {
            return;
          }
          rollbackTracks = tracks;
          let insertIndex = -1,
            delta = 0;
          clip.virtual = true;
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
              const insertGap = track[i].start - lastClipEnd;
              if (clipWidth > insertGap) {
                delta = clipWidth - insertGap;
                clip.start = lastClipEnd;
                clip.end = clip.start + clipWidth;
              } else if (clip.end > track[i].start) {
                delta = clip.end - track[i].start;
              }
              if (delta > 0) {
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
          unmountedClip = {
            ...clip,
            trackId,
            trackIndex,
            clipIndex: insertIndex,
          };
          track.splice(insertIndex, 0, clip);
          setTracks(newTracks);
        }
        // adjust clip
        else if (type === "ADJUST_CLIP") {
          const { id: clipId, ...adjustment } = clip;
          if (unmountedClip) {
            const clipIndex = unmountedClip.clipIndex;
            const rollbackTrack = cloneDeep(
              rollbackTracks[unmountedClip.trackIndex]
            );

            const originalClip = track[clipIndex];
            const adjustedClip = merge(originalClip, adjustment);
            const clipWidth = adjustedClip.end - adjustedClip.start;

            rollbackTrack.splice(clipIndex, 0, adjustedClip);

            rollbackTrack.sort((a, b) => a.start - b.start);

            let delta = 0;

            for (let i = 0; i < rollbackTrack.length; i++) {
              const currentClip = rollbackTrack[i];

              if (delta > 0) {
                currentClip.start += delta;
                currentClip.end += delta;
                continue;
              }

              if (currentClip.id === clipId) {
                unmountedClip.clipIndex = i;
                const lastClip = rollbackTrack[i - 1];
                const nextClip = rollbackTrack[i + 1];

                if (lastClip && currentClip.start < lastClip.end) {
                  // replace last clip with current clip
                  if (currentClip.end < lastClip.end) {
                  } else {
                    const gap = (nextClip?.start || Infinity) - lastClip.end;

                    if (gap < clipWidth) {
                      delta = clipWidth - gap;
                    }
                    currentClip.start = lastClip.end;
                    currentClip.end = currentClip.start + clipWidth;
                  }
                } else if (nextClip && currentClip.end > nextClip.start) {
                  // replace next clip with current clip
                  if (currentClip.start > nextClip.start) {
                  } else {
                    if (nextClip.start < clipWidth) {
                      currentClip.start = 0;
                      currentClip.end = clipWidth;
                      delta = clipWidth - nextClip.start;
                    } else {
                      const gap = nextClip.start - lastClip?.end || 0;
                      if (gap < clipWidth) {
                        currentClip.start = lastClip?.end || 0;
                        currentClip.end = currentClip.start + clipWidth;
                        delta = clipWidth - gap;
                      } else {
                        currentClip.end = nextClip.start;
                        currentClip.start = currentClip.end - clipWidth;
                      }
                    }
                  }
                }
              }
            }

            unmountedClip = {
              ...unmountedClip,
              ...adjustedClip,
            };

            newTracks[unmountedClip.trackIndex] = rollbackTrack;

            setTracks(newTracks);
          } else {
            const clipIndex = track.findIndex(({ id }) => id === clipId);
            if (clipIndex !== -1) {
              let adjustTrack = track;
              const originalClip = track[clipIndex];
              const adjustedClip = merge(originalClip, adjustment);

              if (
                typeof adjustment.trackId !== "undefined" &&
                adjustment.trackId !== trackId
              ) {
                adjustTrack.splice(clipIndex, 1);
                adjustTrack = newTracks[getTrackIndex(adjustment.trackId)];
                adjustTrack.push(adjustedClip);
              } else {
                adjustTrack[clipIndex] = adjustedClip;
              }

              const clipWidth = adjustedClip.end - adjustedClip.start;

              if (typeof clip.isResizing === "undefined") {
                adjustTrack.sort((a, b) => a.start - b.start);
              }

              let delta = 0;

              for (let i = 0; i < adjustTrack.length; i++) {
                const currentClip = adjustTrack[i];

                if (delta > 0) {
                  currentClip.start += delta;
                  currentClip.end += delta;
                  continue;
                }

                if (currentClip.id === clipId) {
                  const lastClip = adjustTrack[i - 1];
                  const nextClip = adjustTrack[i + 1];

                  if (clip.isResizing === "left") {
                    currentClip.start = Math.max(
                      lastClip?.end || 0,
                      currentClip.start
                    );
                  } else if (clip.isResizing === "right") {
                    if (currentClip.end > nextClip?.start) {
                      delta = currentClip.end - nextClip?.start;
                    }
                  } else {
                    if (lastClip && currentClip.start < lastClip.end) {
                      // replace last clip with current clip
                      if (currentClip.end < lastClip.end) {
                      } else {
                        const gap =
                          (nextClip?.start || Infinity) - lastClip.end;
                        if (gap < clipWidth) {
                          delta = currentClip.end - nextClip.start;
                        }
                        currentClip.start = lastClip.end;
                        currentClip.end = currentClip.start + clipWidth;
                      }
                    } else if (nextClip && currentClip.end > nextClip.start) {
                      // replace next clip with current clip
                      if (currentClip.start > nextClip.start) {
                      } else {
                        if (nextClip.start < clipWidth) {
                          currentClip.start = 0;
                          currentClip.end = clipWidth;
                          delta = clipWidth - nextClip.start;
                        } else {
                          currentClip.end = nextClip.start;
                          currentClip.start = currentClip.end - clipWidth;
                        }
                      }
                    }
                  }
                }
              }

              if (adjustment.virtual === false) {
                let i = 1;
                while (i < newTracks.length) {
                  if (newTracks[i].length === 0) {
                    newTracks.splice(i, 1);
                  } else {
                    i++;
                  }
                }
              }

              setTracks(newTracks);
            }
          }
        }
        // destroy clip
        else if (type === "DESTROY_CLIP") {
          if (unmountedClip?.id === clip.id) {
            setTracks(rollbackTracks);
            rollbackTracks = null;
            unmountedClip = null;
            return;
          }
          if (track) {
            const clipIndex = track.findIndex(({ id }) => id === clip?.id);
            if (clipIndex !== -1) {
              newTracks[trackIndex] = track.filter((_, i) => i !== clipIndex);
              setTracks(newTracks);
            }
          }
        }
      }
    }
  };

  return {
    mainTrack,
    auxTracks,
    adjust,
  };
};

export default useTracks;
