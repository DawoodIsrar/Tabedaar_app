import { Redirect } from "expo-router";

import { useAuthStore } from "@/store/authStore";

const Page = () => {
  const { token } = useAuthStore();

  if (token) return <Redirect href="/(root)/(tabs)/home" />;

  return <Redirect href="/(auth)/welcome" />;
};

export default Page;