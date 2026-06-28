import { useRouter } from "expo-router";
import InfoSlide from "@/components/onboarding/InfoSlide";

export default function Slide2() {
  const router = useRouter();
  return (
    <InfoSlide
      icon="camera"
      title="Fotografía tu ropa una vez"
      body="La IA cataloga todo automáticamente."
      activeDot={1}
      buttonLabel="Continuar"
      onNext={() => router.push("/onboarding/slide3")}
    />
  );
}
