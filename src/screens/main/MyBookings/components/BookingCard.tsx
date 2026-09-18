import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Calendar, MapPin, CheckCircle, Clock, XCircle, ArrowRight, BedSingle } from 'lucide-react-native';
import { Colors } from '../../../../constant/colors';
import { TenantBooking } from '../../../../api/bookings';
import { formatNumberIntoCurrency } from '../../../../util/common';

interface Props {
  booking: TenantBooking;
  onPressProperty?: (propertyId: string) => void;
}

const formatDate = (isoString?: string): string => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
};

const formatBookingDate = (isoString?: string): string => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
};

export const BookingCard = ({ booking, onPressProperty }: Props) => {
  const property = booking.room?.roomType?.property;
  const room = booking.room;
  const propertyId = property?.id;
  const imageUrl = property?.imageUrl;

  const getStatusBadge = () => {
    switch (booking.bookingStatus) {
      case 'CONFIRMED':
        return {
          bg: '#ECFDF5',
          text: '#059669',
          border: '#A7F3D0',
          label: 'CONFIRMED',
          icon: <CheckCircle size={13} color="#059669" />,
        };
      case 'PENDING':
        return {
          bg: '#FFFBEB',
          text: '#D97706',
          border: '#FDE68A',
          label: 'PENDING',
          icon: <Clock size={13} color="#D97706" />,
        };
      case 'EXPIRED':
        return {
          bg: '#F3F4F6',
          text: '#6B7280',
          border: '#E5E7EB',
          label: 'EXPIRED',
          icon: <Clock size={13} color="#6B7280" />,
        };
      case 'CANCELLED':
      default:
        return {
          bg: '#FEF2F2',
          text: '#DC2626',
          border: '#FECACA',
          label: booking.bookingStatus || 'CANCELLED',
          icon: <XCircle size={13} color="#DC2626" />,
        };
    }
  };

  const statusStyle = getStatusBadge();

  return (
    <View style={styles.card}>
      {/* Top row: Status Badge & Created Date */}
      <View style={styles.topRow}>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
          {statusStyle.icon}
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {statusStyle.label}
          </Text>
        </View>
        <Text style={styles.createdDate}>
          {formatBookingDate(booking.createdAt)}
        </Text>
      </View>

      {/* Property & Room details */}
      <TouchableOpacity
        activeOpacity={propertyId ? 0.75 : 1}
        disabled={!propertyId}
        onPress={() => propertyId && onPressProperty?.(propertyId)}
        style={styles.propertyRow}
      >
        <View style={styles.thumbnailWrapper}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.thumbnail} resizeMode="cover" />
          ) : (
            <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
              <BedSingle size={24} color={Colors.ICON_GRAY} />
            </View>
          )}
        </View>

        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {property?.title || 'Property Reservation'}
          </Text>

          {property?.address ? (
            <View style={styles.addressRow}>
              <MapPin size={13} color={Colors.ICON_GRAY} />
              <Text style={styles.addressText} numberOfLines={1}>
                {property.address}
              </Text>
            </View>
          ) : null}

          {/* Room and Seat details */}
          <View style={styles.roomBadgeContainer}>
            <View style={styles.roomPill}>
              <Text style={styles.roomText}>
                {room?.name || 'Room'} • Seat #{booking.seatNumber}
              </Text>
            </View>
            {room?.hasAC && (
              <View style={styles.acBadge}>
                <Text style={styles.acText}>AC</Text>
              </View>
            )}
          </View>
        </View>

        {propertyId && (
          <View style={styles.chevronWrapper}>
            <ArrowRight size={16} color={Colors.ICON_GRAY} />
          </View>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Footer: Lease Dates & Total Amount */}
      <View style={styles.footerRow}>
        <View style={styles.leaseContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Calendar size={14} color={Colors.PRIMARY_COLOR} />
            <Text style={styles.leasePeriodText}>
              {formatDate(booking.leaseStart)} – {formatDate(booking.leaseEnd)}
            </Text>
          </View>
          <Text style={styles.durationSubtext}>
            {booking.durationMonths} {booking.durationMonths === 1 ? 'Month' : 'Months'} Lease
          </Text>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            {formatNumberIntoCurrency(Number(booking.totalAmount))}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default BookingCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  createdDate: {
    fontSize: 12,
    color: Colors.TEXT_GRAY,
    fontWeight: '500',
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailWrapper: {
    width: 72,
    height: 72,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  propertyInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  propertyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  addressText: {
    fontSize: 12,
    color: Colors.TEXT_GRAY,
    flex: 1,
  },
  roomBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  roomPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roomText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  acBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  acText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  chevronWrapper: {
    paddingLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaseContainer: {
    flex: 1,
  },
  leasePeriodText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  durationSubtext: {
    fontSize: 11,
    color: Colors.TEXT_GRAY,
    marginTop: 2,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 10,
    color: Colors.TEXT_GRAY,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.PRIMARY_COLOR,
  },
});
