import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, fontSize } from "../theme";
import { formatPrice } from "../utils/formatPrice";
import type { Product } from "../api/product.types";

type Props = {
  product: Product;
  onPress: (product: Product) => void;
};

/**
 * Product source images vary widely in size/aspect ratio (see seed data),
 * so the image is displayed with resizeMode "contain" inside a fixed-size
 * container to avoid distortion or cropping.
 */
export default function ProductCard({ product, onPress }: Props) {
  return (
    <Pressable
      testID="product-card"
      style={styles.card}
      onPress={() => onPress(product)}
      accessibilityRole="button"
      accessibilityLabel={product.name}
    >
      <View style={styles.imageContainer}>
        {product.image ? (
          <Image
            testID="product-card-image"
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View testID="product-card-image-fallback" style={styles.imageFallback}>
            <Text style={styles.imageFallbackText}>No image</Text>
          </View>
        )}
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.price}>{formatPrice(product.price)}</Text>
      <Text style={styles.stock}>Stock: {product.stock}</Text>
    </Pressable>
  );
}

const IMAGE_SIZE = 100;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    margin: spacing.xs,
  },
  imageContainer: {
    width: "100%",
    height: IMAGE_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
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
    borderRadius: radius.sm,
  },
  imageFallbackText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: fontSize.md,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  stock: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
