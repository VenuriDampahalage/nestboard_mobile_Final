import { View, Text } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { styles } from './styles'
import LocationContainer from './components/LocationContainer'
import SearchContainer from './components/SearchContainer'
import PropertyTypesList from './components/PropertyTypesList'
import { PropertyType } from '../../../types/common'
import { Colors } from '../../../constant/colors'
import PropertyList from './components/PropertyList'
import { usePropertyList } from '../../../hooks/usePropertyList'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import FilterPanel from './components/FilterPanel'



const Home = () => {
  const [currentPType, setCurrentPType] = useState<PropertyType>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [checkedCities, setCheckedCities] = useState<{
    city: string;
    checked: boolean;
  }[]>([]);

  const [range, setRange] = useState({
    min: 0,
    max: 20000,
  });

  const [triggerFilter, setTriggerFilter] = useState<number>(0);

  const trigger = () => {
    setTriggerFilter(new Date().getTime());
    bottomSheetModalRef.current?.dismiss();
  };

  const {
    properties,
    initialLoading,
    fetchingMore,
    refreshing,
    error,
    fetchNextBatch,
    refetch,
    handleRefresh,
  } = usePropertyList(currentPType, range, checkedCities, triggerFilter, searchQuery);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // callbacks
  const openFilterPanel = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  return (
    <View style={styles.homeContainer}>
      <LocationContainer />
      <SearchContainer
        openFilterPanel={openFilterPanel}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <PropertyTypesList currentPType={currentPType} setCurrentPType={setCurrentPType} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: 8,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
          }}
        >
          Popular
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: Colors.TEXT_GRAY,
          }}
        >
          See all
        </Text>
      </View>
      <PropertyList
        properties={properties}
        fetchNextBatch={fetchNextBatch}
        initialLoading={initialLoading}
        fetchingMore={fetchingMore}
        refreshing={refreshing}
        error={error}
        refetch={refetch}
        handleRefresh={handleRefresh}
      />
      <FilterPanel
        ref={bottomSheetModalRef}
        checkedCities={checkedCities}
        range={range}
        setCheckedCities={setCheckedCities}
        setRange={setRange}
        trigger={trigger}
      />
    </View>
  );
};

export default Home