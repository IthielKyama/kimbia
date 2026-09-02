import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, RefreshControl, Alert } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

type ExploreScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Explore'>;

export default function ExploreScreen({ navigation }: { navigation: ExploreScreenNavigationProp }) {
  const { data: races, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['races'],
    queryFn: async () => {
      const response = await apiClient.get('/api/races');
      return response.data;
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="flex-row items-center gap-2">
          <Feather name="zap" size={24} color="#FF4C29" />
          <Text className="text-white text-[22px] font-extrabold tracking-wider">KIMBIA</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-surface rounded-full items-center justify-center" onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch}
            tintColor="#FF4C29" 
            colors={['#FF4C29']}
          />
        }
      >
        {/* Search Bar */}
        <View className="flex-row items-center gap-3 mb-5 mt-2">
          <View className="flex-1 bg-surface border border-[#243249] rounded-xl flex-row items-center px-4 h-12">
            <Feather name="search" size={18} color="#9CA3AF" />
            <TextInput 
              className="flex-1 text-white text-[15px] ml-2" 
              placeholder="Search for a race..." 
              placeholderTextColor="#9CA3AF" 
            />
          </View>
          <TouchableOpacity className="w-12 h-12 bg-surface border border-[#243249] rounded-xl items-center justify-center">
            <Feather name="sliders" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View className="h-40 bg-surface rounded-2xl mb-5 relative border border-[#243249]">
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80' }} 
            className="absolute inset-0 w-full h-full rounded-2xl" 
            resizeMode="cover" 
          />
          <View className="absolute inset-0 bg-black/50 z-10 rounded-2xl" />
          <View className="flex-1 p-5 justify-between z-20">
            <View className="self-start bg-primary px-3 py-1 rounded-lg">
              <Text className="text-white text-[11px] font-bold">FEATURED EVENT</Text>
            </View>
            <View className="mt-auto">
              <Text className="text-white text-[22px] font-extrabold mb-1">Kilimanjaro Summit Elevation Run</Text>
              <Text className="text-[#CCFF00] text-[13px]">Join 3,400+ Global Runners Virtually</Text>
            </View>
          </View>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5 flex-row">
          <TouchableOpacity className="bg-primary px-4 py-2 rounded-full mr-2">
            <Text className="text-white font-bold text-[13px]">All</Text>
          </TouchableOpacity>
          {['5K', '10K', 'Half Marathon', 'Full'].map((cat) => (
            <TouchableOpacity key={cat} className="bg-surface px-4 py-2 rounded-full mr-2">
              <Text className="text-white font-bold text-[13px]">{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Upcoming Events Header */}
        <View className="mb-4 mt-2">
          <Text className="text-white text-lg font-bold uppercase">UPCOMING EVENTS</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#FF4C29" className="mt-10" />
        ) : error ? (
          <View className="mt-10 items-center">
            <Feather name="alert-circle" size={32} color="#FF4C29" />
            <Text className="text-[#FF4C29] mt-3 font-bold text-center px-4">
              Error fetching races: {(error as any).response?.data?.message || error.message}
            </Text>
          </View>
        ) : races?.length === 0 ? (
          <View className="mt-10 items-center">
            <Text className="text-placeholder mt-3 text-center">No upcoming races found.</Text>
          </View>
        ) : (
          races?.map((race: any) => (
            <TouchableOpacity 
              key={race.id}
              className="bg-surface rounded-2xl overflow-hidden mb-5 border border-[#243249]"
              onPress={() => navigation.navigate('EventDetails', { raceId: race.id, race })}
            >
              <Image source={{ uri: race.bibTemplateUrl || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80' }} className="h-[130px] w-full" />
              <View className="p-4 flex-col gap-3">
                <View className="flex-row items-center justify-between">
                  <View className="bg-[#1E2A3E] px-2 py-1 rounded-md flex-row items-center gap-1">
                    <Feather name="x-circle" size={12} color="#CCFF00" />
                    <Text className="text-[#CCFF00] font-bold text-xs">{race.distance}</Text>
                  </View>
                  <Text className="text-primary font-bold text-sm">KES {race.fee}</Text>
                </View>
                <View>
                  <Text className="text-white font-bold text-lg mb-2">{race.name}</Text>
                  <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center gap-1">
                      <Feather name="calendar" size={12} color="#9CA3AF" />
                      <Text className="text-[#9CA3AF] text-xs">
                        {new Date(race.raceDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Feather name="users" size={12} color="#9CA3AF" />
                      <Text className="text-[#9CA3AF] text-xs">open</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

                              {/* Bottom Nav Placeholder */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-[#243249]">
        <View className="flex-row items-center justify-between px-4 pt-3 pb-6">
          <TouchableOpacity className="items-center gap-1 w-[72px]" onPress={() => navigation.navigate('Explore')}>
            <Feather name="compass" size={22} color="#FF4C29" />
            <Text className="text-primary font-semibold text-[11px]">Explore</Text>
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
            <Feather name="user" size={22} color="#9CA3AF" />
            <Text className="text-[#9CA3AF] font-semibold text-[11px]">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
