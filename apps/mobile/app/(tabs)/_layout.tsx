import React from 'react'
import { Tabs } from 'expo-router'
import { Home, Search, Library, Sparkles, User } from 'lucide-react-native'
import { BlurView } from 'expo-blur'
import { StyleSheet, View, Platform } from 'react-native'
import { useTheme } from '@/providers/ThemeProvider'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useCurrentTrack } from '@/store/useMobilePlayer'

export default function TabsLayout() {
  const { themeColors } = useTheme()
  const insets = useSafeAreaInsets()
  const hasTrack = !!useCurrentTrack()

  const animatedBottom = useAnimatedStyle(() => ({
    bottom: withTiming(hasTrack ? 0 : insets.bottom, { duration: 300 }),
  }))

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1DB954',
        tabBarInactiveTintColor: themeColors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 4,
          borderTopWidth: 0,
          backgroundColor: Platform.OS === 'web' ? 'rgba(0,0,0,0.8)' : 'transparent',
          elevation: 0,
          borderTopColor: 'transparent',
        },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            {Platform.OS !== 'web' ? (
              <BlurView
                intensity={45}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: Platform.OS === 'web'
                    ? 'rgba(0,0,0,0.82)'
                    : 'rgba(8, 8, 14, 0.62)',
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: 'rgba(255,255,255,0.08)',
                },
              ]}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} Icon={Home} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} Icon={Sparkles} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} Icon={Search} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} Icon={Library} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} Icon={User} />
          ),
        }}
      />
    </Tabs>
  )
}

function TabIcon({
  color,
  focused,
  Icon,
}: {
  color: string
  focused: boolean
  Icon: any
}) {
  return (
    <Animated.View
      style={[
        {
          padding: 4,
          borderRadius: 12,
          backgroundColor: focused ? 'rgba(29,185,84,0.15)' : 'transparent',
          transform: [{ scale: withTiming(focused ? 1.08 : 1, { duration: 150 }) }],
        },
        useAnimatedStyle(() => ({
          transform: [{ scale: withTiming(focused ? 1.08 : 1, { duration: 150 }) }],
        })),
      ]}
    >
      <Icon size={22} color={color} strokeWidth={focused ? 2.4 : 2} />
    </Animated.View>
  )
}
