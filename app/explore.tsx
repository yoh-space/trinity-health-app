import { Redirect, type Href } from "expo-router";

export default function ExploreRedirect() {
  return <Redirect href={"/public/home" as Href} />;
}
