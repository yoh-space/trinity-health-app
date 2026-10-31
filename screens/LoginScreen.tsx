import { useSSO } from "@clerk/expo";
import { AntDesign } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import { useRouter, type Href } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { TouchableOpacity, View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import GoogleIcon from "../components/icons/GoogleIcon";
import { AUTHENTICATED_HOME_TABS } from "../constants/authRoutes";
import { useTrinityStore } from "../store/useTrinityStore";

WebBrowser.maybeCompleteAuthSession();

type OAuthStrategy = "oauth_google" | "oauth_apple";

const LoginScreen = () => {
  const router = useRouter();
  const { startSSOFlow } = useSSO();
  const authReturnTo = useTrinityStore((state) => state.authReturnTo);

  const onPress = async ({ strategy }: { strategy: OAuthStrategy }) => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl: AuthSession.makeRedirectUri({ path: "sso-callback" }),
      });
      if (!createdSessionId || !setActive) return;

      await setActive({
        session: createdSessionId,
        navigate: async ({ decorateUrl }) => {
          const destination = authReturnTo ?? AUTHENTICATED_HOME_TABS;
          const url = decorateUrl(destination);

          if (url.startsWith("http") && typeof window !== "undefined") {
            window.location.href = url;
          } else {
            router.replace(url as Href);
          }
        },
      });
    } catch (err) {
      const message = String(err);
      if (message.includes("already signed in")) {
        return;
      }

      console.error("OAuth error", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* <Image
          source={require("./assets/icon.png")} // Ensure the correct path to your logo image file
          style={styles.logo}
        /> */}
        <Text style={styles.title}>Log in to your account</Text>
        <Text style={styles.subtitle}>Welcome! Please login below.</Text>
        <TouchableOpacity
          style={styles.buttonGoogle}
          onPress={() => {
            onPress({ strategy: "oauth_google" });
          }}
        >
          <GoogleIcon size={20} />
          <Text style={{ ...styles.buttonText, color: "#344054" }}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonApple}
          onPress={() => {
            onPress({ strategy: "oauth_apple" });
          }}
        >
          <AntDesign name="apple" size={24} color="black" />
          <Text
            style={{ ...styles.buttonText, color: "#344054", marginLeft: 12 }}
          >
            Continue with Apple
          </Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={{ fontFamily: "Righteous_400Regular" }}>
            Don’t have an account?{" "}
          </Text>
          <Text>Sign up above.</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    padding: 10,
    alignItems: "center",
    width: "98%",
  },
  logo: {
    width: 74,
    height: 74,
    marginTop: 20,
  },
  title: {
    marginTop: 49,
    fontSize: RFValue(21),
    fontFamily: "Righteous_400Regular",
  },
  subtitle: {
    marginTop: 8,
    fontSize: RFValue(14),
    color: "#000",
    fontFamily: "Righteous_400Regular",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontFamily: "Righteous_400Regular",
    fontSize: RFValue(14),
  },
  buttonEmail: {
    backgroundColor: "#0D87E1",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginBottom: 24,
    minHeight: 44,
  },
  buttonText: {
    textAlign: "center",
    color: "#FFF",
    fontFamily: "Righteous_400Regular",
    fontSize: RFValue(14),
  },
  buttonTextWithIcon: {
    marginLeft: 10,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#000",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#000",
    fontFamily: "Righteous_400Regular",
  },
  buttonGoogle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    width: "100%",
    marginBottom: 12,
    height: 44,
  },
  buttonApple: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    width: "100%",
    marginBottom: 32,
  },
  signupContainer: {
    flexDirection: "row",
  },
  signupText: {
    color: "#4D9DE0",
    fontFamily: "Righteous_400Regular",
  },
  errorText: {
    fontSize: RFValue(14),
    color: "tomato",
    fontFamily: "Righteous_400Regular",
    alignSelf: "flex-start",
    marginBottom: 8,
    marginLeft: 4,
  },
});

export default LoginScreen;
