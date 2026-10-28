import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GuestChoiceChip } from "../components/public/GuestChoiceChip";
import { useTrinityStore } from "../store/useTrinityStore";

export default function CareRequestScreen() {
  const router = useRouter();
  const language = useTrinityStore((state) => state.language);
  const am = language === "am";
  const [supportType, setSupportType] = useState("family");
  const [format, setFormat] = useState<"online" | "inPerson">("online");
  const [acknowledged, setAcknowledged] = useState(false);
  const [previewCreated, setPreviewCreated] = useState(false);

  const submitDemo = () => {
    setPreviewCreated(true);
    Alert.alert(
      am ? "የሙከራ ቅጽ" : "Demo request",
      am
        ? "ምንም አልተላከም፣ ቀጠሮም አልተያዘም። ይህ ባህሪ የሙከራ ብቻ ነው።"
        : "Nothing was sent and no appointment was booked. This is a demo only.",
    );
  };

  const serviceTypes = [
    {
      id: "family",
      en: "General family nutrition",
      am: "አጠቃላይ የቤተሰብ አመጋገብ",
    },
    {
      id: "maternal",
      en: "Pregnancy and breastfeeding nutrition",
      am: "የእርግዝና እና ጡት ማጥባት አመጋገብ",
    },
    {
      id: "child",
      en: "Complementary feeding for young children",
      am: "የታዳጊ ህፃናት ተጨማሪ ምግብ",
    },
  ];

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>
          {am ? "እንክብካቤ፣ ከእርስዎ ጋር" : "CARE, ALONGSIDE YOU"}
        </Text>
        <Text style={styles.title}>
          {am ? "ትንሽ ተጨማሪ ድጋፍ" : "A little extra support"}
        </Text>
        <Text style={styles.subtitle}>
          {am
            ? "ለወደፊት አገልግሎት የተዘጋጀ የሙከራ ቅጽ።"
            : "A demo request form for a future service."}
        </Text>

        <View style={styles.demoNotice}>
          <View style={styles.noticeIcon}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#2E7846"
            />
          </View>
          <View style={styles.noticeCopy}>
            <Text style={styles.noticeTitle}>
              {am ? "የሙከራ ጥያቄ ብቻ" : "Demo request only"}
            </Text>
            <Text style={styles.noticeText}>
              {am
                ? "ምንም አይላክም፣ ምንም ቀጠሮ አይያዝም። ከባለሙያ ጋር አይገናኙም።"
                : "Nothing will be sent and no appointment will be booked."}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {am ? "01 የድጋፍ አይነት" : "01  Type of support"}
          </Text>
          <View style={styles.choiceList}>
            {serviceTypes.map((item) => (
              <GuestChoiceChip
                key={item.id}
                role="radio"
                label={am ? item.am : item.en}
                selected={supportType === item.id}
                onPress={() => setSupportType(item.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {am ? "02 የመገናኛ መንገድ" : "02  Preferred format"}
          </Text>
          <View style={styles.choiceList}>
            <GuestChoiceChip
              role="radio"
              label={am ? "በኢንተርኔት" : "Online"}
              selected={format === "online"}
              onPress={() => setFormat("online")}
            />
            <GuestChoiceChip
              role="radio"
              label={am ? "በአካል" : "In person"}
              selected={format === "inPerson"}
              onPress={() => setFormat("inPerson")}
            />
          </View>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acknowledged }}
          onPress={() => setAcknowledged((current) => !current)}
          style={styles.acknowledgment}
        >
          <View
            style={[styles.checkbox, acknowledged && styles.checkboxChecked]}
          >
            {acknowledged && (
              <Ionicons name="checkmark" size={13} color="#FFFFFF" />
            )}
          </View>
          <Text style={styles.acknowledgmentText}>
            {am
              ? "ይህ የሙከራ ጥያቄ ብቻ መሆኑን ተረድቻለሁ። ምንም አይላክም ወይም አይያዝም።"
              : "I understand this is a demo only. Nothing will be sent or booked."}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !acknowledged }}
          disabled={!acknowledged}
          onPress={submitDemo}
          style={({ pressed }) => [
            styles.submit,
            !acknowledged && styles.submitDisabled,
            pressed && acknowledged && styles.submitPressed,
          ]}
        >
          <Text style={styles.submitText}>
            {am ? "የሙከራ ጥያቄ ፍጠር" : "Create demo request"}
          </Text>
          <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
        </Pressable>

        {previewCreated && (
          <View style={styles.previewResult} accessibilityRole="alert">
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color="#8A641A"
            />
            <View style={styles.previewResultCopy}>
              <Text style={styles.previewResultTitle}>
                {am ? "የሙከራ ጥያቄ ተፈጥሯል" : "Preview created — not sent"}
              </Text>
              <Text style={styles.previewResultText}>
                {am
                  ? "ይህ በመሣሪያዎ ላይ የሚታይ ማሳያ ብቻ ነው። ለባለሙያ አልተላከም፣ ቀጠሮም አልተያዘም።"
                  : "This is a local preview only. Nothing was sent to a professional and no appointment was booked."}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.safetyNotice}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#558262" />
          <Text style={styles.safetyText}>
            {am
              ? "ስም፣ ስልክ፣ አድራሻ ወይም የጤና ዝርዝር አንጠይቅም። ለአስቸኳይ እርዳታ የጤና ተቋምን በቀጥታ ያነጋግሩ።"
              : "We do not ask for names, phone numbers, addresses, or health details. For urgent help, contact a local health service directly."}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            Alert.alert(
              am ? "ኦፓልን ይጠይቁ" : "Ask Opal",
              am
                ? "በዚህ ስሪት የቀጥታ ውይይት አይገኝም። በትምህርት ገጹ ላይ የተዘጋጁ መረጃዎችን ያግኙ።"
                : "Live chat is not available in this version. Browse the Learn section for prepared educational content.",
              [
                {
                  text: am ? "ዝጋ" : "Close",
                  style: "cancel",
                },
                {
                  text: am ? "ትምህርቶችን ክፈት" : "Open learning",
                  onPress: () => router.push("/public/learn" as Href),
                },
              ],
            )
          }
          style={styles.questionsCard}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color="#317A48"
          />
          <View style={styles.questionsCopy}>
            <Text style={styles.questionsTitle}>
              {am ? "አጠቃላይ ጥያቄ አለዎት?" : "Have a general question?"}
            </Text>
            <Text style={styles.questionsSubtitle}>
              {am ? "ኦፓልን ይጠይቁ · የተዘጋጁ መልሶች" : "Ask Opal · prepared answers"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#748579" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F7FAF7", flex: 1 },
  content: { padding: 18, paddingBottom: 28 },
  eyebrow: {
    color: "#438451",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    letterSpacing: 1,
  },
  title: { color: "#1C3524", fontFamily: "Righteous_400Regular", fontSize: 24, marginTop: 8 },
  subtitle: {
    color: "#69786D",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
    marginTop: 6,
  },
  demoNotice: {
    alignItems: "flex-start",
    backgroundColor: "#EAF4EB",
    borderRadius: 15,
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    padding: 13,
  },
  noticeIcon: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  noticeCopy: { flex: 1, gap: 4 },
  noticeTitle: { color: "#28583A", fontFamily: "Righteous_400Regular", fontSize: 11 },
  noticeText: {
    color: "#607363",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    lineHeight: 15,
  },
  section: { marginTop: 21 },
  sectionTitle: {
    color: "#34493A",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
    marginBottom: 9,
  },
  choiceList: { gap: 8 },
  acknowledgment: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 9,
    marginTop: 20,
  },
  checkbox: {
    alignItems: "center",
    borderColor: "#9BAE9E",
    borderRadius: 5,
    borderWidth: 1,
    height: 19,
    justifyContent: "center",
    marginTop: 1,
    width: 19,
  },
  checkboxChecked: { backgroundColor: "#24804A", borderColor: "#24804A" },
  acknowledgmentText: {
    color: "#536458",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    lineHeight: 15,
  },
  submit: {
    alignItems: "center",
    backgroundColor: "#08783D",
    borderRadius: 14,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 48,
  },
  submitDisabled: { backgroundColor: "#A9BBAE" },
  submitPressed: { opacity: 0.82 },
  submitText: { color: "#FFFFFF", fontFamily: "Righteous_400Regular", fontSize: 12 },
  previewResult: {
    alignItems: "flex-start",
    backgroundColor: "#FFF7E8",
    borderColor: "#E6C982",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    marginTop: 12,
    padding: 12,
  },
  previewResultCopy: { flex: 1, gap: 4 },
  previewResultTitle: { color: "#6B4E14", fontFamily: "Righteous_400Regular", fontSize: 11 },
  previewResultText: {
    color: "#755F2D",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    lineHeight: 15,
  },
  safetyNotice: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 7,
    marginTop: 16,
  },
  safetyText: {
    color: "#6E7E72",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    lineHeight: 14,
  },
  questionsCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E3EBE4",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    padding: 12,
  },
  questionsCopy: { flex: 1, gap: 4 },
  questionsTitle: { color: "#314738", fontFamily: "Righteous_400Regular", fontSize: 10 },
  questionsSubtitle: { color: "#748378", fontFamily: "Righteous_400Regular", fontSize: 9 },
});
