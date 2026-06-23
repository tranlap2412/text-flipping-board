import TextFlippingBoardDemo from "@/components/text-flipping-board-demo";
import { LazySpaceBackground } from "@/components/lazy-space-background";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <LazySpaceBackground />
      <div className="relative z-10 mx-auto w-full max-w-[90rem] px-4 py-6 md:px-8 md:py-8">
        <TextFlippingBoardDemo />
      </div>
    </div>
  );
}
