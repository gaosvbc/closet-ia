import { useRouter } from "expo-router";
import InfoSlide from "@/components/onboarding/InfoSlide";

export default function Slide3() {
  const router = useRouter();
  return (
    <InfoSlide
      icon="layers"
      title="Cada mañana, tu look perfecto"
      body="Según el clima, tu agenda y lo que realmente te queda."
      activeDot={2}
      buttonLabel="Empezar mi perfil"
      onNext={() => router.push("/onboarding/body-profile")}
    />
  );
}
