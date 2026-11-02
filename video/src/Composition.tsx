import { Composition, Still } from "remotion";
import { Credits, ParroquiaVideo, totalFrames } from "./Video";
import { FPS } from "./theme";

export const MyComposition = () => {
  return (
    <>
      <Composition
        id="Parroquia4K"
        component={ParroquiaVideo}
        durationInFrames={totalFrames()}
        fps={FPS}
        width={3840}
        height={2160}
      />
      <Composition
        id="ParroquiaHD"
        component={ParroquiaVideo}
        durationInFrames={totalFrames()}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Still id="Creditos" component={Credits} width={1920} height={1080} />
    </>
  );
};
