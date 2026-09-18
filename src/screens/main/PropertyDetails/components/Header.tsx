import { View, StyleSheet } from 'react-native'
import React from 'react'
import { ArrowLeft, Heart } from 'lucide-react-native'
import { Colors } from '../../../../constant/colors'
import RoundButton from '../../../../components/ui/RoundButton'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../../store/store'
import { togglePropertyFavorite } from '../../../../store/favouriteSlice'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const PropertyHeader = () => {
  const nav: any = useNavigation();
  const dispatch = useDispatch();
  const gap = useSafeAreaInsets();

  const currentProperty = useSelector((state: RootState) => state.property.currentProperty);
  const isFavorite = useSelector((state: RootState) =>
    currentProperty?.id
      ? (state.favourite.favouriteIds[currentProperty.id] ?? currentProperty.isFavorite ?? false)
      : false
  );

  const handleToggleFavorite = () => {
    if (currentProperty) {
      dispatch(togglePropertyFavorite(currentProperty) as any);
    }
  };

  return (
    <View style={[styles.container, {
      paddingTop: gap.top
    }]}>
      <RoundButton
        Icon={<ArrowLeft color={Colors.SECONDARY_COLOR} size={20} />}
        onPress={() => {
          nav.goBack();
        }}
      />
      <View style={{ flex: 1 }}></View>
      <RoundButton
        Icon={
          <Heart
            color={isFavorite ? Colors.PRIMARY_COLOR : Colors.SECONDARY_COLOR}
            fill={isFavorite ? Colors.PRIMARY_COLOR : 'none'}
            size={20}
          />
        }
        onPress={handleToggleFavorite}
      />
    </View>
  )
}

export default PropertyHeader

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
  },
  nest: {
    color: Colors.SECONDARY_COLOR,
    fontSize: 30,
    fontWeight: '700',
  }
})