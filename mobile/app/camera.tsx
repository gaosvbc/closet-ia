import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CameraModal from "@/components/camera/CameraModal";

// Full-screen camera modal route (presented modally from the root stack).
export default function CameraScreen() {
  const router = useRouter();
  return (
    <>
      <StatusBar style="light" />
      <CameraModal onClose={() => router.back()} />
    </>
  );
}
