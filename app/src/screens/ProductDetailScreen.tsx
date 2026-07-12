import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radius, spacing, fontSize } from "../theme";
import { formatPrice } from "../utils/formatPrice";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetail">;

export default function ProductDetailScreen({ navigation, route }: Props) {
  const { product } = route.params;
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        {product.image ? (
          <Image
            testID="product-detail-image"
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View testID="product-detail-image-fallback" style={styles.imageFallback}>
            <Text style={styles.imageFallbackText}>No image</Text>
          </View>
        )}
      </View>

      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{formatPrice(product.price)}</Text>
      <Text style={styles.stock}>Stock: {product.stock}</Text>
      <Text style={styles.description}>{product.description}</Text>

      <PrimaryButton
        title="Back"
        variant="outline"
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      />
    </ScrollView>
  );
}

const IMAGE_SIZE = 220;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  imageContainer: {
    width: "100%",
    height: IMAGE_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.border,
    borderRadius: radius.md,
  },
  imageFallbackText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  stock: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
});
