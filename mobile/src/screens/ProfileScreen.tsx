import { View, Text, ScrollView, TouchableOpacity , Image, ActivityIndicator } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export default function ProfileScreen({ navigation }: any) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await apiClient.get('/api/users/me');
      return response.data;
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="w-10 h-10" />
        <Text className="text-white text-lg font-bold text-center">RUNNER PROFILE</Text>
        <TouchableOpacity 
          className="w-10 h-10 bg-surface rounded-full items-center justify-center"
          onPress={() => navigation.navigate('Settings')}
        >
          <Feather name="settings" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Bio Header */}
        <View className="flex-row items-center gap-4 mb-5">
          <Image source={{ uri: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=400&q=80' }} className="w-20 h-20 rounded-full border-2 border-primary" />
          <View className="flex-col gap-1">
            {isLoading ? (
              <ActivityIndicator color="#FF4C29" />
            ) : (
              <Text className="text-white font-extrabold text-[22px]">{user?.name || 'Kimbia Runner'}</Text>
            )}
            <Text className="text-placeholder text-[13px]">Kimbia Runner since Jan 2026</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 bg-surface p-3 rounded-xl flex-col gap-1">
            <Text className="text-placeholder text-[11px] uppercase">Completed</Text>
            <Text className="text-white font-extrabold text-base">4 Races</Text>
          </View>
          <View className="flex-1 bg-surface p-3 rounded-xl flex-col gap-1">
            <Text className="text-placeholder text-[11px] uppercase">Total Distance</Text>
            <Text className="text-primary font-extrabold text-base">56.2 KM</Text>
          </View>
          <View className="flex-1 bg-surface p-3 rounded-xl flex-col gap-1">
            <Text className="text-placeholder text-[11px] uppercase">Avg Pace</Text>
            <Text className="text-[#CCFF00] font-extrabold text-base">4:08 /km</Text>
          </View>
        </View>

        {/* Bib Gallery */}
        <View className="flex-col gap-3 mb-5">
          <Text className="text-white font-bold text-base uppercase">My Digital Bibs (2)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
            <View className="w-[200px] h-[120px] rounded-xl overflow-hidden mr-3 border-2 border-primary">
              <Image source={{ uri: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=400&q=80' }} className="absolute inset-0 w-full h-full opacity-40" />
              <View className="absolute inset-0 p-4 flex-col gap-2">
                <View className="flex-row justify-between w-full">
                  <Text className="text-primary font-black text-xs">KIMBIA</Text>
                  <Text className="text-placeholder text-[10px]">10K</Text>
                </View>
                <Text className="text-white font-black text-[32px] text-center">1240</Text>
                <Text className="text-placeholder font-semibold text-[11px]">Rift Valley 10K</Text>
              </View>
            </View>
            
            <View className="w-[200px] h-[120px] rounded-xl overflow-hidden border-2 border-[#CCFF00]">
              <Image source={{ uri: 'https://images.unsplash.com/photo-1505051508008-923feaf90180?auto=format&fit=crop&w=400&q=80' }} className="absolute inset-0 w-full h-full opacity-40" />
              <View className="absolute inset-0 p-4 flex-col gap-2">
                <View className="flex-row justify-between w-full">
                  <Text className="text-[#CCFF00] font-black text-xs">KIMBIA</Text>
                  <Text className="text-placeholder text-[10px]">5K</Text>
                </View>
                <Text className="text-white font-black text-[32px] text-center">3582</Text>
                <Text className="text-placeholder font-semibold text-[11px]">Nairobi Trail 5K</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Upcoming Races */}
        <View className="flex-col gap-3 mb-5">
          <Text className="text-white font-bold text-base uppercase">Next Up</Text>
          <View className="bg-surface p-4 rounded-2xl flex-row items-center gap-3">
            <View className="w-[54px] h-[54px] bg-gray-800 rounded-lg" />
            <View className="flex-col gap-0.5">
              <Text className="text-white font-bold text-[15px]">Nairobi Midnight Half</Text>
              <Text className="text-primary font-semibold text-xs">Nov 02 • Distance: 21.1 KM</Text>
            </View>
          </View>
        </View>

        {/* Past Results */}
        <View className="flex-col gap-3 mb-5">
          <Text className="text-white font-bold text-base uppercase">Recent Achievements</Text>
          <View className="bg-surface p-4 rounded-2xl flex-row justify-between items-center mb-2">
            <View className="flex-col gap-1">
              <Text className="text-white font-bold text-[15px]">Rift Valley 10K</Text>
              <Text className="text-placeholder text-xs">Oct 12, 2026</Text>
            </View>
            <View className="flex-col gap-0.5 items-end">
              <Text className="text-[#CCFF00] font-bold text-[15px]">00:41:24</Text>
              <Text className="text-primary font-bold text-xs">#4 Men</Text>
            </View>
          </View>
          <View className="bg-surface p-4 rounded-2xl flex-row justify-between items-center">
            <View className="flex-col gap-1">
              <Text className="text-white font-bold text-[15px]">Nairobi Trail 5K</Text>
              <Text className="text-placeholder text-xs">Sep 04, 2026</Text>
            </View>
            <View className="flex-col gap-0.5 items-end">
              <Text className="text-[#CCFF00] font-bold text-[15px]">00:19:42</Text>
              <Text className="text-primary font-bold text-xs">#2 Men</Text>
            </View>
          </View>
        </View>

      </ScrollView>

                              {/* Bottom Nav Placeholder */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-[#243249]">
        <View className="flex-row items-center justify-between px-4 pt-3 pb-6">
          <TouchableOpacity className="items-center gap-1 w-[72px]" onPress={() => navigation.navigate('Explore')}>
            <Feather name="compass" size={22} color="#9CA3AF" />
            <Text className="text-[#9CA3AF] font-semibold text-[11px]">Explore</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center gap-1 w-[72px]" onPress={() => navigation.navigate('Leaderboard')}>
            <Feather name="award" size={22} color="#9CA3AF" />
            <Text className="text-[#9CA3AF] font-semibold text-[11px]">Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center gap-1 w-[72px]" onPress={() => navigation.navigate('MyEvents')}>
            <Feather name="calendar" size={22} color="#9CA3AF" />
            <Text className="text-[#9CA3AF] font-semibold text-[11px]">My Events</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center gap-1 w-[72px]" onPress={() => navigation.navigate('Profile')}>
            <Feather name="user" size={22} color="#FF4C29" />
            <Text className="text-primary font-semibold text-[11px]">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
