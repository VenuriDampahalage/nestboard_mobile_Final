import { View, Text, TouchableOpacity, ListRenderItemInfo, ImageBackground } from 'react-native'
import React, { useMemo } from 'react'
import { useNavigation } from '@react-navigation/native';
import { styles } from './PropertyList';
import LinearGradient from 'react-native-linear-gradient';
import { Star, Heart } from 'lucide-react-native';
import { Colors } from '../../../../constant/colors';
import { PropertyItem as PItem } from '../../../../types/properties';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { togglePropertyFavorite } from '../../../../store/favouriteSlice';

type Props = {
  dt: ListRenderItemInfo<PItem>
}

export const PropertyItem = ({ dt }: Props) => {
  const height = 320;

  const nav: any = useNavigation();
  const dispatch = useDispatch();
  const styles_ = useMemo(() => styles(height), [height]);

  const isFavorite = useSelector((state: RootState) =>
    state.favourite.favouriteIds[dt.item.id] ?? dt.item.isFavorite ?? false
  );

  const handleFavoritePress = () => {
    dispatch(togglePropertyFavorite(dt.item) as any);
  };

  return (
    <TouchableOpacity onPress={() => {
      nav.navigate('PropertyDetails', {
        pid: dt.item.id
      })
    }} style={styles_.propertContainer}>
      <ImageBackground style={styles_.imageBackground} source={
        {
          uri: dt.item.image || dt.item.imageUrl
        }
      }>
        <LinearGradient style={styles_.gradientBackground}
          colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0,255)']}>
          <View>
            <Text style={{ color: 'white', fontSize: 12, letterSpacing: 0.6 }}>{dt.item.type}</Text>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: '700' }}>{dt.item.title}</Text>
            <Text style={{ color: 'white' }}>{dt.item.location}</Text>
          </View>
          <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: '700' }}>{dt.item.price}</Text>
            <Text style={{ color: 'white' }}>{"Month"}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      {/* Favorite button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleFavoritePress}
        style={styles_.favoriteContainer}
      >
        <Heart
          size={18}
          color={isFavorite ? Colors.PRIMARY_COLOR : Colors.SECONDARY_COLOR}
          fill={isFavorite ? Colors.PRIMARY_COLOR : 'none'}
        />
      </TouchableOpacity>

      {/* Rating badge */}
      <View style={styles_.ratingContainer}>
        <Star color={Colors.PRIMARY_COLOR} />
        <Text style={styles_.ratingText}>{dt.item.rating}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default PropertyItem