import { View, Text, TextInput } from 'react-native'
import React from 'react'
import { Search } from 'lucide-react-native'
import { Colors } from '../../constant/colors'

type Props = {
  value?: string;
  onChangeText?: (text: string) => void;
};

const SearchInput = ({ value, onChangeText }: Props) => {
  return (
    <View style={{
      height: 48,
      width: '100%',
      borderRadius: 100,
      elevation: 2,
      backgroundColor: 'white',
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12
    }}>
      <Search color={Colors.ICON_GRAY} />
      <TextInput
        placeholder='Search your place'
        placeholderTextColor={Colors.TEXT_GRAY}
        value={value}
        onChangeText={onChangeText}
        style={{
          flex: 1,
          color: 'black',
          backgroundColor: 'white'
        }}
      />
    </View>
  )
}

export default SearchInput