import { useState, useRef, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";

import useClips from "./hooks/useClips";
import useTracks from "./hooks/useTracks";

import WorkbenchPanel from "./components/WorkbenchPanel";
import TimelinePanel from "./components/TimelinePanel";
import ClipBlock from "./components/ClipBlock";

function customCollisionDetectionAlgorithm(args) {
  const pointerCollisions = pointerWithin(args);

  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  const { pointerCoordinates, droppableContainers } = args;
  const collisions = [];

  const firstDroppableGap = droppableContainers.find(
    (container) => container.id === "gap-0"
  );

  if (
    firstDroppableGap &&
    pointerCoordinates.y <= firstDroppableGap.rect.current.top
  ) {
    collisions.push({
      id: "gap-0",
      data: { droppableContainer: firstDroppableGap },
    });
  }

  return collisions;
}

const App = () => {
  const { clips } = useClips();
  const [activeClip, setActiveClip] = useState(null);
  const { adjust } = useTracks();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        tolerance: 5,
      },
    })
  );

  const overTrackId = useRef(null);

  const activeClipDragOverlay = useMemo(() => {
    if (activeClip?.id) {
      if (activeClip.width) {
        return (
          <div
            style={{
              height: 36,
              backgroundColor: activeClip.color,
              width: activeClip.width,
            }}
            className="rounded-[8px]"
          ></div>
        );
      } else {
        return <ClipBlock id={activeClip.id} color={activeClip.color} />;
      }
    }
    return null;
  }, [activeClip]);

  const handleDragStart = (event) => {
    const { active } = event;
    const clip = active.data.current.clip;
    if (clip) {
      setActiveClip({
        width: clip.end - clip.start,
        ...clip,
      });
      adjust("ADJUST_CLIP", {
        trackId: clip.trackId,
        clip: {
          id: clip.id,
          virtual: true,
        },
      });
    } else {
      setActiveClip({
        id: uuidv4(),
        color: active.data.current.color,
      });
    }
  };

  const handleDragMove = (event) => {
    const { active, over } = event;
    if (activeClip) {
      if (activeClip.width) {
        if (over && overTrackId.current !== null) {
          if (over.data.current.track) {
            const start = Math.max(
              active.rect.current.translated.left - over.rect.left,
              0
            );
            adjust("ADJUST_CLIP", {
              trackId: activeClip.trackId,
              clip: {
                id: activeClip.id,
                start,
                end: start + activeClip.width,
                trackId: overTrackId.current,
              },
            });
            setActiveClip({
              ...activeClip,
              trackId: overTrackId.current,
            });
          } else if (
            over.data.current.clip &&
            !over.data.current.clip.virtual
          ) {
            const start = Math.max(
              active.rect.current.translated.left -
                over.rect.left +
                over.data.current.clip.start,
              0
            );
            adjust("ADJUST_CLIP", {
              trackId: activeClip.trackId,
              clip: {
                id: activeClip.id,
                start,
                end: start + activeClip.width,
                trackId: overTrackId.current,
              },
            });
            setActiveClip({
              ...activeClip,
              trackId: overTrackId.current,
            });
          } else if (over.data.current.gap) {
            // overTrackId.current = over.id;
          }
        }
      } else {
        if (over && overTrackId.current !== null) {
          if (over.data.current.track) {
            const start = Math.max(
              active.rect.current.translated.left - over.rect.left,
              0
            );
            adjust("ADJUST_CLIP", {
              trackId: overTrackId.current,
              clip: {
                id: activeClip.id,
                start,
                end: start + 100,
              },
            });
          } else if (
            over.data.current.clip &&
            !over.data.current.clip.virtual
          ) {
            overTrackId.current = over.data.current.clip.trackId;
            const start = Math.max(
              active.rect.current.translated.left -
                over.rect.left +
                over.data.current.clip.start,
              0
            );
            adjust("ADJUST_CLIP", {
              trackId: overTrackId.current,
              clip: {
                id: activeClip.id,
                start,
                end: start + 100,
              },
            });
          }
        }
      }
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;

    if (activeClip) {
      if (activeClip.width) {
        if (over) {
          if (over.data.current.track) {
            overTrackId.current = over.id;
          } else if (over.data.current.clip) {
            overTrackId.current = over.data.current.clip.trackId;
          }
        } else if (overTrackId.current !== null) {
          // adjust("DESTROY_CLIP", {
          //   trackId: activeClip.trackId,
          //   clip: {
          //     id: activeClip.id,
          //   },
          // });
          overTrackId.current = null;
        }
      } else {
        if (over) {
          if (over.data.current.track) {
            overTrackId.current = over.id;
            const start = Math.max(
              active.rect.current.translated.left - over.rect.left,
              0
            );
            adjust("INSERT_VIRTUAL_CLIP", {
              trackId: overTrackId.current,
              clip: {
                id: activeClip.id,
                color: activeClip.color,
                start,
                end: start + 100,
              },
            });
          } else if (over.data.current.clip) {
            overTrackId.current = over.data.current.clip.trackId;
            const start = Math.max(
              active.rect.current.translated.left -
                over.rect.left +
                over.data.current.clip.start,
              0
            );
            adjust("INSERT_VIRTUAL_CLIP", {
              trackId: overTrackId.current,
              clip: {
                id: activeClip.id,
                color: activeClip.color,
                start,
                end: start + 100,
              },
            });
          } else if (over.data.current.gap) {
            adjust("DESTROY_CLIP", {
              trackId: overTrackId.current,
              clip: {
                id: activeClip.id,
              },
            });
            overTrackId.current = over.id;
          }
        } else if (overTrackId.current !== null) {
          adjust("DESTROY_CLIP", {
            trackId: overTrackId.current,
            clip: {
              id: activeClip.id,
            },
          });
          overTrackId.current = null;
        }
      }
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (activeClip) {
      if (activeClip.width) {
        if (over && overTrackId.current !== null) {
          if (over.data.current.gap) {
            const start = Math.max(
              active.rect.current.translated.left - over.rect.left,
              0
            );
            adjust("INSERT_TRACK", {
              insertIndex: over.data.current.i,
              clip: {
                trackId: activeClip.trackId,
                id: activeClip.id,
                color: activeClip.color,
                start,
                end: start + activeClip.end - activeClip.start,
              },
            });
          } else {
            adjust("ADJUST_CLIP", {
              trackId: activeClip.trackId,
              clip: {
                id: activeClip.id,
                virtual: false,
              },
            });
          }
        }
      } else {
        if (over && overTrackId.current !== null) {
          if (over.data.current.gap) {
            const start = Math.max(
              active.rect.current.translated.left - over.rect.left,
              0
            );
            adjust("INSERT_TRACK", {
              insertIndex: over.data.current.i,
              clip: {
                id: activeClip.id,
                color: activeClip.color,
                start,
                end: start + 100,
              },
            });
          } else {
            adjust("INSERT_CLIP");
          }
        }
        overTrackId.current = null;
      }
      setActiveClip(null);
    }
  };

  return (
    <div className="w-full h-screen flex flex-row">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        collisionDetection={customCollisionDetectionAlgorithm}
      >
        <SortableContext items={clips} strategy={verticalListSortingStrategy}>
          <WorkbenchPanel />
          <TimelinePanel />
          <DragOverlay dropAnimation={null}>
            {activeClipDragOverlay}
          </DragOverlay>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default App;
