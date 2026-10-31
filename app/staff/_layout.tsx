import { Stack } from "expo-router";
import { StaffAccountProvider } from "../../components/staff/StaffAccountProvider";

export default function StaffLayout() {
  return (
    <StaffAccountProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </StaffAccountProvider>
  );
}
