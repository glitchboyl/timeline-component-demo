import { useState, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";

import WorkbenchPanel from "./components/WorkbenchPanel";
import TimelinePanel from "./components/TimelinePanel";
import ClipBlock from "./components/ClipBlock";
import useClips from "./hooks/useClips";
import useTracks from "./hooks/useTracks";

const App = () => {
  const { clips } = useClips();
  const [activeClip, setActiveClip] = useState(null);
  const { adjustTrack, insertClip, destroyClip } = useTracks();
  const sensors = useSensors(useSensor(PointerSensor));

  const overTrackId = useRef(null);

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveClip({
      id: uuidv4(),
      color: active.data.current.color,
    });
  };

  const handleDragMove = (event) => {
    const { active, over } = event;
    if (over && overTrackId.current) {
      const start = Math.max(
        active.rect.current.translated.left - over.rect.left,
        0
      );
      const end = start + 100;
      adjustTrack(overTrackId.current, activeClip.id, {
        start,
        end,
      });
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (over) {
      if (over.data.current.track) {
        overTrackId.current = over.id;
        const start = Math.max(
          active.rect.current.translated.left - over.rect.left,
          0
        );
        const end = start + 100;
        insertClip(over.id, {
          id: activeClip.id,
          color: activeClip.color,
          start,
          end,
          virtual: true,
        });
      } else {
        overTrackId.current = null;
      }
    } else if (overTrackId.current !== null) {
      destroyClip(overTrackId.current, activeClip.id);
      overTrackId.current = null;
    }
  };

  const handleDragEnd = (event) => {
    const { over } = event;
    if (over && overTrackId.current !== null) {
      adjustTrack(overTrackId.current, activeClip.id, {
        virtual: false,
      });
    }
    overTrackId.current = null;
  };

  return (
    <div className="w-full h-screen flex flex-row">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={clips}>
          <WorkbenchPanel />
          <TimelinePanel />
          <DragOverlay dropAnimation={null}>
            {activeClip?.id ? (
              <ClipBlock id={activeClip.id} color={activeClip.color} />
            ) : null}
          </DragOverlay>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default App;
