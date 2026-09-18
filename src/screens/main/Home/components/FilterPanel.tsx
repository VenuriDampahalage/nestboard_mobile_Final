import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import Typography from '../../../../components/ui/Typography';
import CheckBoxComp from '../../../../components/ui/CheckboxComp';
import Slider from '@react-native-community/slider';
import { Colors } from '../../../../constant/colors';
import { formatNumberIntoCurrency } from '../../../../util/common';
import RegularButton from '../../../../components/ui/RegularButton';
import { PropertyAPI } from '../../../../api/properties';
import { AlertCircle } from 'lucide-react-native';

interface Props {
  checkedCities: {
    city: string;
    checked: boolean;
  }[],
  range: {
    min: number;
    max: number;
  },
  setCheckedCities: (b: {
    city: string;
    checked: boolean;
  }[]) => void,
  setRange: (data: {
    min: number;
    max: number;
  }) => void,
  trigger: () => void
}

const FilterPanel = forwardRef<BottomSheetModal, Props>(
  ({ checkedCities, range, setCheckedCities, setRange, trigger }, ref) => {

    const [cities, setCities] = useState<string[]>([]);
    const [citiesLoading, setCitiesLoading] = useState(true);
    const [citiesError, setCitiesError] = useState(false);

    const fetchCities = async () => {
      setCitiesLoading(true);
      setCitiesError(false);
      try {
        const data = await PropertyAPI.getCities();
        setCities(data);
      } catch (err) {
        console.error('Failed to fetch cities', err);
        setCitiesError(true);
      } finally {
        setCitiesLoading(false);
      }
    };

    useEffect(() => {
      fetchCities();
    }, []);

    const renderBackdrop = useCallback(
      (backdropProps: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...backdropProps}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    const handleSheetChanges = useCallback((index: number) => {
      console.log('handleSheetChanges', index);
    }, []);

    return (
      <BottomSheetModal
        ref={ref}
        backdropComponent={renderBackdrop}
        enableContentPanningGesture={false}
        onChange={handleSheetChanges}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Typography variant='h1'>Filters</Typography>

          <View style={{ marginTop: 24, gap: 10 }}>
            <Typography variant='h2'>Cities</Typography>
            {citiesLoading ? (
              <ActivityIndicator color={Colors.PRIMARY_COLOR} style={{ marginVertical: 12 }} />
            ) : citiesError ? (
              <TouchableOpacity onPress={fetchCities} style={styles.errorRow}>
                <AlertCircle color={Colors.PRIMARY_COLOR} size={18} />
                <Typography variant='body' style={{ color: Colors.PRIMARY_COLOR, marginLeft: 6 }}>
                  Failed to load cities. Tap to retry.
                </Typography>
              </TouchableOpacity>
            ) : (
              cities.map(city =>
                <CheckBoxComp
                  key={city}
                  isSelected={checkedCities.find(obj => obj.city === city)?.checked}
                  title={city}
                  checkedCities={checkedCities}
                  setCheckedCities={setCheckedCities}
                />
              )
            )}
          </View>

          <View style={{ marginTop: 24, gap: 10 }}>
            <Typography variant='h2'>Price</Typography>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Typography variant='h3'>{formatNumberIntoCurrency(range.min)}</Typography>
              <Typography variant='h3'>{formatNumberIntoCurrency(range.max)}</Typography>
            </View>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={100000}
              minimumTrackTintColor={Colors.PRIMARY_COLOR}
              thumbTintColor={Colors.PRIMARY_COLOR}
              maximumTrackTintColor="#000000"
              value={range.min}
              onValueChange={(value) => {
                // Clamp: min must always stay at least 1000 below max
                const clamped = Math.min(value, range.max - 1000);
                setRange({ ...range, min: Math.max(0, clamped) });
              }}
              thumbSize={32}
            />
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={1000}
              maximumValue={100000}
              minimumTrackTintColor={Colors.PRIMARY_COLOR}
              thumbTintColor={Colors.PRIMARY_COLOR}
              maximumTrackTintColor="#000000"
              value={range.max}
              thumbSize={32}
              onValueChange={(value) => {
                // Clamp: max must always stay at least 1000 above min
                const clamped = Math.max(value, range.min + 1000);
                setRange({ ...range, max: clamped });
              }}
            />
          </View>
          <RegularButton marginTop={20} onPress={trigger} text='Filter' Icon={null} />
        </BottomSheetView>
      </BottomSheetModal>
    )
  }
)

export default FilterPanel

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingBottom: 100,
    padding: 24
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  }
});
