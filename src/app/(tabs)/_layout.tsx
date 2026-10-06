import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface TabIconProps {
  active: IconName;
  inactive: IconName;
  color: ColorValue;
  focused: boolean;
  size: number;
}

function TabIcon({ active, inactive, color, focused, size }: TabIconProps) {
  return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
}

export default function TabLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: { backgroundColor: theme.tabBar, borderTopColor: theme.border },
        headerStyle: { backgroundColor: theme.background },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: Fonts.serif, fontSize: 20, color: theme.text },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: (props) => <TabIcon {...props} active="home" inactive="home-outline" />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Calendar',
          tabBarIcon: (props) => <TabIcon {...props} active="calendar" inactive="calendar-outline" />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Gallery',
          tabBarIcon: (props) => <TabIcon {...props} active="images" inactive="images-outline" />,
        }}
      />
      <Tabs.Screen
        name="proofs"
        options={{
          title: 'My Proofs',
          tabBarIcon: (props) => <TabIcon {...props} active="albums" inactive="albums-outline" />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: (props) => (
            <TabIcon {...props} active="ellipsis-horizontal-circle" inactive="ellipsis-horizontal-circle-outline" />
          ),
        }}
      />
    </Tabs>
  );
}
