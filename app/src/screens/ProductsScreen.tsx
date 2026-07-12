import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../features/auth/authSlice";
import {
  applyFilters,
  clearFilters,
  fetchProducts,
  setPage,
} from "../features/products/productsSlice";
import PrimaryButton from "../components/PrimaryButton";
import TextField from "../components/TextField";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import FiltersPanel, { type PriceFilters } from "../components/FiltersPanel";
import Backdrop from "../components/Backdrop";
import Skeleton from "../components/Skeleton";
import { colors, spacing, fontSize } from "../theme";
import type { Product } from "../api/product.types";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Products">;

const SKELETON_COUNT = 6;

export default function ProductsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { items, page, totalPages, filters, status, error } = useAppSelector(
    (state) => state.products,
  );
  const [searchText, setSearchText] = useState(filters.name);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch, page, filters]);

  async function handleLogout() {
    await dispatch(logout());
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  function handleSearch() {
    dispatch(applyFilters({ ...filters, name: searchText.trim() }));
  }

  function handleApplyPriceFilters({ minPrice, maxPrice }: PriceFilters) {
    dispatch(applyFilters({ name: filters.name, minPrice, maxPrice }));
  }

  function handleClearFilters() {
    setSearchText("");
    dispatch(clearFilters());
  }

  function handleProductPress(product: Product) {
    navigation.navigate("ProductDetail", { product });
  }

  const isLoading = status === "loading";
  const isError = status === "failed";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        {user?.username ? (
          <Text style={styles.subtitle}>Welcome, {user.username}</Text>
        ) : null}

        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <TextField
              label="Search products"
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search by name"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
          </View>
          <PrimaryButton
            title="Search"
            onPress={handleSearch}
            style={styles.searchButton}
          />
        </View>
      </View>

      <Backdrop
        toggleLabel="Filters"
        backLayer={
          <FiltersPanel
            onApply={handleApplyPriceFilters}
            onClear={handleClearFilters}
            initialMinPrice={filters.minPrice}
            initialMaxPrice={filters.maxPrice}
          />
        }
        frontLayer={
          <>
            {isError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{error}</Text>
                <PrimaryButton
                  title="Retry"
                  variant="outline"
                  onPress={() => dispatch(fetchProducts())}
                  style={styles.retryButton}
                />
              </View>
            ) : isLoading ? (
              <View style={styles.skeletonGrid} testID="products-skeleton-grid">
                {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                  <View key={index} style={styles.skeletonCard}>
                    <Skeleton
                      testID={`skeleton-image-${index}`}
                      width="100%"
                      height={100}
                      style={styles.skeletonSpacing}
                    />
                    <Skeleton
                      testID={`skeleton-line-${index}`}
                      width="80%"
                      height={14}
                      style={styles.skeletonSpacing}
                    />
                    <Skeleton testID={`skeleton-line2-${index}`} width="50%" height={14} />
                  </View>
                ))}
              </View>
            ) : items.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No products found.</Text>
              </View>
            ) : (
              <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                numColumns={2}
                renderItem={({ item }) => (
                  <ProductCard product={item} onPress={handleProductPress} />
                )}
                contentContainerStyle={styles.list}
              />
            )}

            {!isError && totalPages > 0 ? (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPrev={(newPage) => dispatch(setPage(newPage))}
                onNext={(newPage) => dispatch(setPage(newPage))}
              />
            ) : null}
          </>
        }
      />

      <PrimaryButton title="Log out" variant="outline" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  searchField: {
    flex: 1,
  },
  searchButton: {
    marginTop: spacing.md + 2,
    paddingHorizontal: spacing.lg,
  },
  errorBanner: {
    backgroundColor: colors.error,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    color: colors.onError,
    fontSize: fontSize.sm,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  retryButton: {
    borderColor: colors.onError,
  },
  skeletonGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skeletonCard: {
    width: "48%",
    margin: spacing.xs,
    padding: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skeletonSpacing: {
    marginBottom: spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  list: {
    flexGrow: 1,
  },
});
