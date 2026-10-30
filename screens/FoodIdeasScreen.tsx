import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { GuestChoiceChip } from "../components/public/GuestChoiceChip";
import { useTrinityStore } from "../store/useTrinityStore";

const ingredients = [
  { id: "lentils", en: "Misir", am: "ምስር" }, { id: "shiro", en: "Shiro", am: "ሽሮ" },
  { id: "cabbage", en: "Gommen", am: "ጎመን" }, { id: "egg", en: "Eggs", am: "እንቁላል" },
  { id: "oats", en: "Oats", am: "አጃ" }, { id: "potato", en: "Potatoes", am: "ድንች" },
  { id: "carrot", en: "Carrots", am: "ካሮት" }, { id: "avocado", en: "Avocado", am: "አቮካዶ" },
  { id: "injera", en: "Teff injera", am: "ጤፍ እንጀራ" },
];
const allergies = [{ id: "egg", en: "Egg", am: "እንቁላል" }, { id: "nuts", en: "Peanuts / tree nuts", am: "ኦቾሎኒ / ለውዝ" }, { id: "dairy", en: "Milk / dairy", am: "ወተት እና የወተት ተዋጽኦ" }, { id: "sesame", en: "Sesame", am: "ሰሊጥ" }];
const recipes = [
  { id: "lentil-vegetable", en: "Lentil and vegetable plate", am: "የምስርና አትክልት ምግብ", ingredients: ["lentils", "carrot", "cabbage"], allergens: [] },
  { id: "shiro-injera", en: "Shiro with teff injera", am: "ሽሮ ከጤፍ እንጀራ ጋር", ingredients: ["shiro", "injera"], allergens: ["sesame"] },
  { id: "potato-cabbage", en: "Potato and cabbage stew", am: "የድንችና ጎመን ወጥ", ingredients: ["potato", "cabbage", "carrot"], allergens: [] },
];

export default function FoodIdeasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const language = useTrinityStore((state) => state.language);
  const setLanguage = useTrinityStore((state) => state.setLanguage);
  const am = language === "am";
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [audience, setAudience] = useState<"family" | "child">("family");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [noKnownAllergies, setNoKnownAllergies] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [error, setError] = useState("");

  const toggleIngredient = (id: string) => { setError(""); setHasGenerated(false); setSelectedIngredients((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]); };
  const toggleAllergy = (id: string) => { setError(""); setHasGenerated(false); setNoKnownAllergies(false); setSelectedAllergies((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]); };
  const confirmNoAllergies = () => { setError(""); setHasGenerated(false); setSelectedAllergies([]); setNoKnownAllergies((value) => !value); };
  const showIdeas = () => { if (!selectedIngredients.length) { setError(am ? "ቢያንስ አንድ ግብዓት ይምረጡ።" : "Choose at least one ingredient."); return; } if (!noKnownAllergies && !selectedAllergies.length) { setError(am ? "የአለርጂ ምርጫ ያድርጉ።" : "Choose an allergy option."); return; } setError(""); setHasGenerated(true); };
  const matches = recipes.filter((recipe) => recipe.ingredients.some((id) => selectedIngredients.includes(id)) && !recipe.allergens.some((id) => selectedAllergies.includes(id)));

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Trinity Health Solution home" onPress={() => router.replace("/public/home" as Href)} style={styles.brand}><View style={styles.logo}><Ionicons name="leaf-outline" size={17} color="#16803F" /></View><View><Text style={styles.brandName}>Trinity Health Solution</Text><Text style={styles.brandTag}>GROWING GOOD, TOGETHER</Text></View></Pressable>
          <View style={styles.headerActions}><Pressable accessibilityLabel="Saved lessons" onPress={() => router.push("/public/saved" as Href)} style={styles.headerIcon}><Ionicons name="bookmark-outline" size={14} color="#365B41" /></Pressable><Pressable accessibilityLabel="Settings" onPress={() => setSettingsVisible(true)} style={styles.headerIcon}><Ionicons name="settings-outline" size={14} color="#365B41" /></Pressable></View>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>{am ? "በኩሽና ውስጥ እንጀምር" : "LET’S START IN THE KITCHEN"}</Text>
          <Text style={styles.title}>{am ? "ካለዎት ነገር ጥሩ ነገር ይስሩ።" : "Something good from\nwhat you have."}</Text>
          <Text style={styles.subtitle}>{am ? "የተለመዱ ግብዓቶች። ለቤተሰብ ጠረጴዛ ቀላል ሀሳቦች።" : "Familiar ingredients. Simple ideas for the family table."}</Text>
          <View style={styles.section}><Text style={styles.sectionTitle}><Text style={styles.step}>01</Text> {am ? "በኩሽናዎ ምን አለ?" : "What’s in your kitchen?"}</Text><View style={styles.ingredientGrid}>{ingredients.map((item) => <GuestChoiceChip key={item.id} compact label={am ? item.am : item.en} selected={selectedIngredients.includes(item.id)} onPress={() => toggleIngredient(item.id)} />)}</View></View>
          <View style={styles.section}><Text style={styles.sectionTitle}><Text style={styles.step}>02</Text> {am ? "ማን ነው የሚመገበው?" : "Who’s gathering at the table?"}</Text><View style={styles.audienceStack}><GuestChoiceChip role="radio" label={am ? "ቤተሰብ" : "The family"} selected={audience === "family"} onPress={() => setAudience("family")} /><GuestChoiceChip role="radio" label={am ? "ታዳጊ ህፃን · ከ6 ወር በላይ" : "A young child · 6 months or older"} selected={audience === "child"} onPress={() => setAudience("child")} /></View></View>
          <View style={styles.section}><Text style={styles.sectionTitle}><Text style={styles.step}>03</Text> {am ? "ምን እንዳይካተት?" : "Anything to leave out?"}</Text><Text style={styles.hint}>{am ? "ለዚህ ሙከራ ብቻ ምረጥ።" : "Choose for this demo only. Your selections are not saved."}</Text><View style={styles.ingredientGrid}><GuestChoiceChip compact label={am ? "ምንም የታወቀ የለም" : "None known"} selected={noKnownAllergies} onPress={confirmNoAllergies} />{allergies.map((item) => <GuestChoiceChip compact key={item.id} label={am ? item.am : item.en} selected={selectedAllergies.includes(item.id)} onPress={() => toggleAllergy(item.id)} />)}</View></View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable onPress={showIdeas} style={styles.generate}><Text style={styles.generateText}>{am ? "የምግብ ሀሳቦችን አሳይ" : "Show meal ideas"}</Text><Ionicons name="arrow-forward" size={15} color="#FFFFFF" /></Pressable>
          {hasGenerated ? <View style={styles.results}><Text style={styles.resultsTitle}>{am ? "የሚስማሙ ሀሳቦች" : "Ideas matching your selections"}</Text>{matches.length ? matches.map((recipe) => <View key={recipe.id} style={styles.recipe}><Ionicons name="restaurant-outline" size={17} color="#367A49" /><Text style={styles.recipeText}>{am ? recipe.am : recipe.en}</Text></View>) : <Text style={styles.hint}>{am ? "ምንም ሀሳብ የለም።" : "No sample ideas match those selections."}</Text>}</View> : null}
          <View style={styles.bottomSpace} />
        </ScrollView>
        <Pressable accessibilityLabel="Ask Opal" onPress={() => router.push("/public/opal" as Href)} style={styles.opal}><Ionicons name="sparkles-outline" size={14} color="#FFFFFF" /><Text style={styles.opalText}>Ask Opal</Text></Pressable>
      </View>
      <Modal transparent visible={settingsVisible} animationType="fade" onRequestClose={() => setSettingsVisible(false)}><Pressable style={[styles.modalBackdrop, { paddingBottom: 14 + insets.bottom }]} onPress={() => setSettingsVisible(false)}><Pressable style={styles.modal} onPress={() => undefined}><Text style={styles.modalTitle}>{am ? "ቋንቋ" : "Choose a language"}</Text><Pressable onPress={() => { setLanguage("en"); setSettingsVisible(false); }} style={styles.modalOption}><Text style={styles.modalText}>English</Text></Pressable><Pressable onPress={() => { setLanguage("am"); setSettingsVisible(false); }} style={styles.modalOption}><Text style={styles.modalText}>አማርኛ</Text></Pressable></Pressable></Pressable></Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safeArea: { backgroundColor: "#F7FAF7", flex: 1 }, page: { flex: 1 }, header: { alignItems: "center", backgroundColor: "#F7FAF7", borderBottomColor: "#E4ECE5", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 47, paddingHorizontal: 11 }, brand: { alignItems: "center", flexDirection: "row", gap: 6 }, logo: { alignItems: "center", backgroundColor: "#E7F4E8", borderRadius: 12, height: 27, justifyContent: "center", width: 27 }, brandName: { color: "#285638", fontFamily: "Righteous_400Regular", fontSize: 9 }, brandTag: { color: "#7D9581", fontFamily: "Righteous_400Regular", fontSize: 5, letterSpacing: .6, marginTop: 2 }, headerActions: { flexDirection: "row", gap: 7 }, headerIcon: { alignItems: "center", height: 28, justifyContent: "center", width: 22 }, content: { paddingBottom: 18, paddingHorizontal: 12, paddingTop: 12 }, eyebrow: { color: "#438451", fontFamily: "Righteous_400Regular", fontSize: 7, letterSpacing: 1, marginBottom: 6 }, title: { color: "#1D3023", fontFamily: "Righteous_400Regular", fontSize: 20, lineHeight: 21 }, subtitle: { color: "#6D7B70", fontFamily: "Righteous_400Regular", fontSize: 8, lineHeight: 12, marginTop: 6, maxWidth: 170 }, section: { marginTop: 12 }, sectionTitle: { color: "#283D2D", fontFamily: "Righteous_400Regular", fontSize: 11 }, step: { color: "#4A8657", fontFamily: "Righteous_400Regular" }, ingredientGrid: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 7 }, audienceStack: { gap: 5, marginTop: 7 }, hint: { color: "#7B897E", fontFamily: "Righteous_400Regular", fontSize: 8, lineHeight: 12, marginTop: 5 }, error: { color: "#A25B43", fontFamily: "Righteous_400Regular", fontSize: 8, marginTop: 9 }, generate: { alignItems: "center", backgroundColor: "#16803F", borderRadius: 10, flexDirection: "row", gap: 6, justifyContent: "center", marginTop: 13, minHeight: 36 }, generateText: { color: "#FFFFFF", fontFamily: "Righteous_400Regular", fontSize: 9 }, results: { marginTop: 14 }, resultsTitle: { color: "#294433", fontFamily: "Righteous_400Regular", fontSize: 13, marginBottom: 7 }, recipe: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E1E9E2", borderRadius: 9, borderWidth: 1, flexDirection: "row", gap: 7, marginBottom: 5, padding: 9 }, recipeText: { color: "#364C3B", fontFamily: "Righteous_400Regular", fontSize: 9 }, bottomSpace: { height: 22 }, opal: { alignItems: "center", backgroundColor: "#178344", borderRadius: 20, bottom: 8, elevation: 5, flexDirection: "row", gap: 4, paddingHorizontal: 11, paddingVertical: 8, position: "absolute", right: 12, shadowColor: "#123B20", shadowOpacity: .2, shadowRadius: 5 }, opalText: { color: "#FFFFFF", fontFamily: "Righteous_400Regular", fontSize: 9 }, modalBackdrop: { backgroundColor: "#17321C66", flex: 1, justifyContent: "flex-end", padding: 14 }, modal: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16 }, modalTitle: { color: "#28412F", fontFamily: "Righteous_400Regular", fontSize: 16, marginBottom: 7 }, modalOption: { borderColor: "#E1EAE2", borderRadius: 10, borderWidth: 1, marginTop: 6, padding: 11 }, modalText: { color: "#3B5C44", fontFamily: "Righteous_400Regular", fontSize: 11 } });
