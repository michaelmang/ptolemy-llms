import CosmosCanvas from "@/components/scene/CosmosCanvas";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import InfoPanel from "@/components/ui/InfoPanel";
import IntroOverlay from "@/components/ui/IntroOverlay";
import { SceneProvider } from "@/lib/scene-context";

export default function Home() {
  return (
    <SceneProvider>
      <main className="relative h-dvh w-full overflow-hidden bg-black">
        <CosmosCanvas />
        <Header />
        <Footer />
        <InfoPanel />
        <IntroOverlay />
      </main>
    </SceneProvider>
  );
}
