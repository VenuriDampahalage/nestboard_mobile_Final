import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useMemo } from 'react'
import { PropertyItem as PItem } from '../../../../types/properties';
import PropertyItemSkeleton from './PropertyItemSkeleton';
import PropertyItem from './PropertyItem';
import Typography from '../../../../components/ui/Typography';
import RegularButton from '../../../../components/ui/RegularButton';
import { FileQuestionMark, AlertCircle } from 'lucide-react-native';
import { Colors } from '../../../../constant/colors';

type Props = {
  properties: PItem[];
  fetchNextBatch: () => void;
  initialLoading: boolean;
  fetchingMore: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => void;
  handleRefresh: () => void;
}

const PropertyList = ({
  properties,
  fetchNextBatch,
  initialLoading,
  fetchingMore,
  refreshing,
  error,
  refetch,
  handleRefresh,
}: Props) => {
  const height = 320;
  const styles_ = useMemo(() => styles(height), [height]);

  // 1. Initial Loading Skeletons State
  if (initialLoading) {
    return (
      <View style={styles_.flexContainer}>
        <PropertyItemSkeleton />
        <View style={{ height: 16 }} />
        <PropertyItemSkeleton />
      </View>
    );
  }

  // 2. Error State View with Retry Button
  if (error) {
    return (
      <View style={styles_.centeredContainer}>
        <AlertCircle color={Colors.PRIMARY_COLOR} size={64} />
        <Typography variant="h2" style={{ marginTop: 12, textAlign: 'center' }}>
          {error}
        </Typography>
        <RegularButton text="Try Again" Icon={AlertCircle} onPress={refetch} marginTop={16} />
      </View>
    );
  }

  return (
    <View style={styles_.flexContainer}>
      <FlatList
        showsVerticalScrollIndicator={false}
        style={styles_.flexContainer}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        data={properties}
        keyExtractor={(data) => data.id}
        renderItem={(dt) => <PropertyItem dt={dt} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.PRIMARY_COLOR]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles_.centeredContainer}>
            <FileQuestionMark color={Colors.ICON_GRAY} size={80} />
            <Typography variant="h2" style={{ marginTop: 12 }}>
              No properties found
            </Typography>
            <Typography variant="body" style={{ color: Colors.TEXT_GRAY, marginTop: 4 }}>
              Try adjusting your search or filters.
            </Typography>
          </View>
        )}
        ListFooterComponent={
          fetchingMore ? (
            <View style={{ paddingVertical: 20, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={Colors.PRIMARY_COLOR} />
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 140 }}
        onEndReached={fetchNextBatch}
        onEndReachedThreshold={0.3}
      />
    </View>
  );
};

export default PropertyList

export const styles = (height: number) => StyleSheet.create({
  propertContainer: {
    borderRadius: 16,
    width: '100%',
    height: height,
    overflow: 'hidden'
  },
  ratingContainer: {
    backgroundColor: 'white',
    height: 36,
    position: 'absolute',
    flexDirection: 'row',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    right: 16,
    top: 16,
    gap: 6
  },
  favoriteContainer: {
    backgroundColor: 'white',
    width: 36,
    height: 36,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    left: 16,
    top: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600'
  },
  gradientBackground: {
    flexDirection: 'row',
    backgroundColor: '#00000090',
    padding: 24,
    justifyContent: 'space-between'
  },
  imageBackground: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end'
  },
  flexContainer: {
    flex: 1
  },
  centeredContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  }
})