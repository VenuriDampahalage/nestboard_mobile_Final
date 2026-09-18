import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Star, MapPin, Heart } from 'lucide-react-native';
import { Colors } from '../../../../constant/colors';
import { PropertyItem } from '../../../../types/properties';
import Typography from '../../../../components/ui/Typography';

interface Props {
  item: PropertyItem;
  onPress: (id: string) => void;
  onRemove: (item: PropertyItem) => void;
}

export const FavouriteCard = ({ item, onPress, onRemove }: Props) => {
  const imageUrl = item.image || item.imageUrl;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress(item.id)}
      style={styles.card}
    >
      {/* Thumbnail */}
      <View style={styles.imageWrapper}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]} />
        )}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.type}</Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={(e) => {
              e.stopPropagation();
              onRemove(item);
            }}
            style={styles.heartButton}
          >
            <Heart
              size={20}
              color={Colors.PRIMARY_COLOR}
              fill={Colors.PRIMARY_COLOR}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={14} color={Colors.ICON_GRAY} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>{item.price}</Text>
            <Text style={styles.pricePeriod}> / month</Text>
          </View>

          {item.rating !== undefined && (
            <View style={styles.ratingBadge}>
              <Star size={13} color={Colors.PRIMARY_COLOR} fill={Colors.PRIMARY_COLOR} />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FavouriteCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  imageWrapper: {
    width: 104,
    height: 104,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F4F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#E2E2EA',
  },
  typeBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  details: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    flex: 1,
    marginRight: 8,
  },
  heartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
    color: Colors.TEXT_GRAY,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.PRIMARY_COLOR,
  },
  pricePeriod: {
    fontSize: 12,
    color: Colors.TEXT_GRAY,
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF6F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.PRIMARY_COLOR,
  },
});
