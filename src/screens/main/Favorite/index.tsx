import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, AlertCircle, Compass } from 'lucide-react-native';
import { Colors } from '../../../constant/colors';
import { RootState } from '../../../store/store';
import {
  fetchFavourites,
  togglePropertyFavorite,
} from '../../../store/favouriteSlice';
import FavouriteCard from './components/FavouriteCard';
import Skeleton from '../../../components/ui/Skeleton';
import RegularButton from '../../../components/ui/RegularButton';
import Typography from '../../../components/ui/Typography';
import { PropertyItem } from '../../../types/properties';

const CardSkeleton = () => (
  <View style={styles.skeletonCard}>
    <Skeleton width={104} height={104} style={{ borderRadius: 16 }} />
    <View style={styles.skeletonDetails}>
      <Skeleton width="70%" height={18} style={{ borderRadius: 6, marginBottom: 8 }} />
      <Skeleton width="50%" height={14} style={{ borderRadius: 6, marginBottom: 14 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="40%" height={16} style={{ borderRadius: 6 }} />
        <Skeleton width={40} height={20} style={{ borderRadius: 10 }} />
      </View>
    </View>
  </View>
);

const Favorite = () => {
  const insets = useSafeAreaInsets();
  const nav: any = useNavigation();
  const dispatch = useDispatch();

  const { favourites, loading, refreshing, error } = useSelector(
    (state: RootState) => state.favourite
  );

  // Fetch or refresh favourites whenever the tab is focused
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchFavourites() as any);
    }, [dispatch])
  );

  const handleRefresh = () => {
    dispatch(fetchFavourites(true) as any);
  };

  const handleOpenProperty = (id: string) => {
    nav.navigate('PropertyDetails', { pid: id });
  };

  const handleRemoveFavorite = (item: PropertyItem) => {
    dispatch(togglePropertyFavorite(item) as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Saved Properties</Text>
          <Text style={styles.headerSubtitle}>
            {favourites.length === 1
              ? '1 property saved'
              : `${favourites.length} properties saved`}
          </Text>
        </View>
        {favourites.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{favourites.length}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      {loading && favourites.length === 0 ? (
        <View style={styles.listContainer}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </View>
      ) : error && favourites.length === 0 ? (
        <View style={styles.centeredContainer}>
          <AlertCircle color={Colors.PRIMARY_COLOR} size={64} />
          <Typography variant="h2" style={{ marginTop: 14, textAlign: 'center' }}>
            Failed to Load
          </Typography>
          <Typography
            variant="body"
            style={{ color: Colors.TEXT_GRAY, marginTop: 6, textAlign: 'center', marginHorizontal: 24 }}
          >
            {error}
          </Typography>
          <RegularButton
            text="Try Again"
            Icon={<AlertCircle size={18} color={Colors.WHITE} />}
            onPress={() => dispatch(fetchFavourites() as any)}
            marginTop={20}
          />
        </View>
      ) : (
        <FlatList
          data={favourites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FavouriteCard
              item={item}
              onPress={handleOpenProperty}
              onRemove={handleRemoveFavorite}
            />
          )}
          contentContainerStyle={[
            styles.listContainer,
            favourites.length === 0 && styles.emptyListContainer,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.PRIMARY_COLOR]}
              tintColor={Colors.PRIMARY_COLOR}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyStateWrapper}>
              <View style={styles.emptyIconCircle}>
                <Heart size={44} color={Colors.PRIMARY_COLOR} />
              </View>
              <Typography variant="h1" style={styles.emptyTitle}>
                No saved properties yet
              </Typography>
              <Typography variant="body" style={styles.emptyDescription}>
                Properties you favorite will appear here so you can easily compare, review, and book them later.
              </Typography>
              <RegularButton
                text="Explore Properties"
                Icon={<Compass size={18} color={Colors.WHITE} />}
                onPress={() => nav.navigate('Home')}
                marginTop={24}
              />
            </View>
          }
        />
      )}
    </View>
  );
};

export default Favorite;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.TEXT_GRAY,
    marginTop: 2,
    fontWeight: '500',
  },
  countBadge: {
    backgroundColor: '#FFF1EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE0D1',
  },
  countBadgeText: {
    color: Colors.PRIMARY_COLOR,
    fontWeight: '700',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 130, // Clearance for floating bottom tab bar
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  skeletonDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  emptyStateWrapper: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF1EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFE5D8',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.TEXT_GRAY,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});