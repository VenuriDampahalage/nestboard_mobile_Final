import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Calendar, AlertCircle, Compass } from 'lucide-react-native';
import { Colors } from '../../../constant/colors';
import { RootState } from '../../../store/store';
import { fetchMyBookings } from '../../../store/bookingSlice';
import BookingCard from './components/BookingCard';
import Skeleton from '../../../components/ui/Skeleton';
import RegularButton from '../../../components/ui/RegularButton';
import RoundButton from '../../../components/ui/RoundButton';
import Typography from '../../../components/ui/Typography';

type FilterTab = 'ALL' | 'CONFIRMED' | 'PENDING' | 'OTHER';

const BookingSkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
      <Skeleton width={90} height={22} style={{ borderRadius: 12 }} />
      <Skeleton width={80} height={16} style={{ borderRadius: 8 }} />
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Skeleton width={72} height={72} style={{ borderRadius: 14 }} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Skeleton width="75%" height={18} style={{ borderRadius: 6, marginBottom: 8 }} />
        <Skeleton width="55%" height={14} style={{ borderRadius: 6, marginBottom: 8 }} />
        <Skeleton width="40%" height={20} style={{ borderRadius: 8 }} />
      </View>
    </View>
    <View style={{ height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 }} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Skeleton width="45%" height={16} style={{ borderRadius: 6 }} />
      <Skeleton width="25%" height={20} style={{ borderRadius: 6 }} />
    </View>
  </View>
);

const MyBookings = () => {
  const insets = useSafeAreaInsets();
  const nav: any = useNavigation();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  const { myBookings, loading, refreshing, error } = useSelector(
    (state: RootState) => state.booking
  );

  // Fetch or refresh bookings on focus
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMyBookings() as any);
    }, [dispatch])
  );

  const handleRefresh = () => {
    dispatch(fetchMyBookings(true) as any);
  };

  const handleOpenProperty = (propertyId: string) => {
    nav.navigate('PropertyDetails', { pid: propertyId });
  };

  // Filter bookings based on activeTab
  const filteredBookings = myBookings.filter((b) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'CONFIRMED') return b.bookingStatus === 'CONFIRMED';
    if (activeTab === 'PENDING') return b.bookingStatus === 'PENDING';
    if (activeTab === 'OTHER')
      return b.bookingStatus === 'EXPIRED' || b.bookingStatus === 'CANCELLED';
    return true;
  });

  const confirmedCount = myBookings.filter((b) => b.bookingStatus === 'CONFIRMED').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <RoundButton
          Icon={<ArrowLeft color={Colors.SECONDARY_COLOR} size={20} />}
          onPress={() => nav.goBack()}
        />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSubtitle}>
            {myBookings.length === 1
              ? '1 reservation'
              : `${myBookings.length} reservations`}
            {confirmedCount > 0 ? ` • ${confirmedCount} confirmed` : ''}
          </Text>
        </View>
        <View style={{ width: 48 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {(
            [
              { id: 'ALL', label: `All (${myBookings.length})` },
              { id: 'CONFIRMED', label: `Confirmed (${confirmedCount})` },
              {
                id: 'PENDING',
                label: `Pending (${myBookings.filter((b) => b.bookingStatus === 'PENDING').length})`,
              },
              {
                id: 'OTHER',
                label: `Past / Other (${
                  myBookings.filter(
                    (b) => b.bookingStatus === 'EXPIRED' || b.bookingStatus === 'CANCELLED'
                  ).length
                })`,
              },
            ] as const
          ).map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.tabButton, isSelected && styles.activeTabButton]}
              >
                <Text style={[styles.tabText, isSelected && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {loading && myBookings.length === 0 ? (
        <View style={styles.listContainer}>
          <BookingSkeletonCard />
          <BookingSkeletonCard />
        </View>
      ) : error && myBookings.length === 0 ? (
        <View style={styles.centeredContainer}>
          <AlertCircle color={Colors.PRIMARY_COLOR} size={60} />
          <Typography variant="h2" style={{ marginTop: 14, textAlign: 'center' }}>
            Unable to Load Bookings
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
            onPress={() => dispatch(fetchMyBookings() as any)}
            marginTop={20}
          />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookingCard booking={item} onPressProperty={handleOpenProperty} />
          )}
          contentContainerStyle={[
            styles.listContainer,
            filteredBookings.length === 0 && styles.emptyListContainer,
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
                <Calendar size={44} color={Colors.PRIMARY_COLOR} />
              </View>
              <Typography variant="h1" style={styles.emptyTitle}>
                {activeTab === 'ALL'
                  ? 'No bookings yet'
                  : `No ${activeTab.toLowerCase()} bookings`}
              </Typography>
              <Typography variant="body" style={styles.emptyDescription}>
                {activeTab === 'ALL'
                  ? "You haven't reserved any rooms yet. Browse available properties to find your ideal stay."
                  : 'There are currently no reservations in this category.'}
              </Typography>
              {activeTab === 'ALL' && (
                <RegularButton
                  text="Explore Properties"
                  Icon={<Compass size={18} color={Colors.WHITE} />}
                  onPress={() => nav.navigate('Tab')}
                  marginTop={24}
                />
              )}
            </View>
          }
        />
      )}
    </View>
  );
};

export default MyBookings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.TEXT_GRAY,
    marginTop: 2,
    fontWeight: '500',
  },
  tabsWrapper: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeTabButton: {
    backgroundColor: '#FFF1EB',
    borderWidth: 1,
    borderColor: '#FFE0D1',
  },
  tabText: {
    fontSize: 13,
    color: Colors.TEXT_GRAY,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.PRIMARY_COLOR,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyStateWrapper: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
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
