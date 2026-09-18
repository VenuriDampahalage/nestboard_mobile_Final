import { View, Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react'
import Header from '../../screens/main/Home/components/Header';
import Home from '../../screens/main/Home';
import Favorite from '../../screens/main/Favorite';
import { Heart, House, Map, Search as Sh, User } from 'lucide-react-native';
import PropertyMap from '../../screens/main/PropertyMap';
import Profile from '../../screens/main/Profile';
import { Colors } from '../../constant/colors';
import Search from '../../screens/main/Search';
import { BottomTabView } from './BottomTabView';

const Tab = createBottomTabNavigator();

export const Tabs = [
  {
    defaultIcon: <House size={24} color={Colors.ICON_GRAY} />,
    selectedIcon: <House size={24} color={Colors.WHITE} />,
  },
  {
    defaultIcon: <Sh size={24} color={Colors.ICON_GRAY} />,
    selectedIcon: <Sh size={24} color={Colors.WHITE} />,
  },
  {
    defaultIcon: <Heart size={24} color={Colors.ICON_GRAY} />,
    selectedIcon: <Heart size={24} color={Colors.WHITE} />,
  },
  {
    defaultIcon: <Map size={24} color={Colors.ICON_GRAY} />,
    selectedIcon: <Map size={24} color={Colors.WHITE} />,
  },
  {
    defaultIcon: <User size={24} color={Colors.ICON_GRAY} />,
    selectedIcon: <User size={24} color={Colors.WHITE} />,
  }
]

const TabScreens = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabView {...props} />}
    >
      <Tab.Screen name='Home' options={
        {
          header: Header,
          headerShown: true
        }
      } component={Home}
      />
      <Tab.Screen name='Search' component={Search} />
      <Tab.Screen name='Favorite' component={Favorite} options={{ headerShown: false }} />
      <Tab.Screen name='PropertyMap' component={PropertyMap} options={
        {
          headerShown: false
        }
      } />
      <Tab.Screen name='Profile' component={Profile} />
    </Tab.Navigator>
  )
}

export default TabScreens