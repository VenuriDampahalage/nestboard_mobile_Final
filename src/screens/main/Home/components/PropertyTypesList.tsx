import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { CircleStop, House, Landmark, MapPin, Building2 } from 'lucide-react-native'
import SwitchButton from '../../../../components/ui/SwitchButton'
import { Colors } from '../../../../constant/colors'
import { PropertyType } from '../../../../types/common'

const Menu = [
  {
    title: "All",
    WhiteIcon: <CircleStop color={'white'} />,
    GrayIcon: <CircleStop color={Colors.ICON_GRAY} />
  },
  {
    title: "House",
    WhiteIcon: <House color={'white'} />,
    GrayIcon: <House color={Colors.ICON_GRAY} />
  },
  {
    title: "Villa",
    WhiteIcon: <Landmark color={'white'} />,
    GrayIcon: <Landmark color={Colors.ICON_GRAY} />
  },
  {
    title: "Apartment",
    WhiteIcon: <MapPin color={'white'} />,
    GrayIcon: <MapPin color={Colors.ICON_GRAY} />
  },
  {
    title: "Hotel",
    WhiteIcon: <Building2 color={'white'} />,
    GrayIcon: <Building2 color={Colors.ICON_GRAY} />
  },
]

type Props = {
  currentPType: PropertyType,
  setCurrentPType: (type: PropertyType) => void
}

const PropertyTypesList = ({ currentPType, setCurrentPType }: Props) => {

  return (
    <View >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          {
            gap: 12,
            paddingVertical: 10,
          }
        }>
        {
          Menu.map(i =>
            <SwitchButton
              key={i.title}
              selected={currentPType == i.title}
              text={i.title}
              Icon={(currentPType == i.title) ? i.WhiteIcon : i.GrayIcon}
              onPress={() => {
                setCurrentPType(i.title as PropertyType);
              }} />
          )
        }
      </ScrollView>
    </View>
  )
}

export default PropertyTypesList