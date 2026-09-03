import { View, Text } from 'react-native'
import React from 'react'
import SearchInput from '../../../../components/ui/SearchInput'
import RoundButton from '../../../../components/ui/RoundButton'
import { Filter, SlidersHorizontal } from 'lucide-react-native'
import { Colors } from '../../../../constant/colors'

type Props = {
  openFilterPanel: () => void;
  searchQuery: string;
  setSearchQuery: (text: string) => void;
}

const SearchContainer = ({ openFilterPanel, searchQuery, setSearchQuery }: Props) => {
  return (
    <View style={
      {
        flexDirection: 'row',
        gap: 12
      }
    }>
      <View style={{ flex: 1 }}>
        <SearchInput value={searchQuery} onChangeText={setSearchQuery} />
      </View>
      <RoundButton
        onPress={openFilterPanel}
        Icon={<SlidersHorizontal color={Colors.SECONDARY_COLOR} size={20} />}
      />
    </View>
  )
}

export default SearchContainer