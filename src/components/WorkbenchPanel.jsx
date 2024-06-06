import useClips from "../hooks/useClips";
import ClipBlock from "./ClipBlock";

const WorkbenchPanel = () => {
  const { clips, addClip } = useClips();

  return (
    <div className="w-[280px] p-[16px] bg-workbench-panel-bg text-white">
      <div className="pb-[16px]">
        <button
          onClick={addClip}
          className="w-full h-[36px] text-[14px] text-button-text bg-button-bg/10 rounded-[8px] hover:bg-button-bg/[0.14] transition-all duration-100 ease-linear"
        >
          Add Clip
        </button>
      </div>
      <div className="flex flex-wrap justify-between">
        {clips.map((clip) => (
          <ClipBlock id={clip.id} color={clip.color} key={clip.id} />
        ))}
      </div>
    </div>
  );
};

export default WorkbenchPanel;
