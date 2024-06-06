import { atom, useAtom } from "jotai";
import { v4 as uuidv4 } from "uuid";

const generateRandomColor = () => {
  const hex = () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0");

  const hexColor = `#${hex()}${hex()}${hex()}`;

  return hexColor;
};

const clipsAtom = atom([]);

const useClips = () => {
  const [clips, setClips] = useAtom(clipsAtom);

  const addClip = () => {
    setClips((_clips) => [
      ..._clips,
      {
        id: uuidv4(),
        color: generateRandomColor(),
      },
    ]);
  };

  // const removeClip = (clipId) => {
  //   const removedClipIndex = clips.findIndex((clip) => clip.id === clipId);
  //   if (removedClipIndex !== -1) {
  //     setClips((_clips) => _clips.filter((_, i) => i !== removedClipIndex));
  //   }
  // };

  return {
    clips,
    addClip,
    // removeClip,
  };
};

export default useClips;
