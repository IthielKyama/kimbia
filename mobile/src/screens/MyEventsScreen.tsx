import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

type MyEventsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyEvents'>;

export default function MyEventsScreen({ navigation }: { navigation: MyEventsScreenNavigationProp }) {
  const { data: registrations, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      const response = await apiClient.get('/api/registrations/my-events');
      return response.data;
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-[#243249]">
        <Text className="text-white text-xl font-bold">My Events</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5 pt-4" 
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
        {isLoading ? (
          <ActivityIndicator color="#FF4C29" className="mt-10" />
        ) : error ? (
          <View className="mt-10 items-center">
            <Feather name="alert-circle" size={32} color="#FF4C29" />
            <Text className="text-[#FF4C29] mt-3 font-bold text-center px-4">
              Error fetching events: {(error as any).response?.data?.message || error.message}
            </Text>
          </View>
        ) : registrations?.length === 0 ? (
          <View className="mt-20 items-center">
            <View className="w-16 h-16 rounded-full bg-surface items-center justify-center mb-4">
              <Feather name="calendar" size={24} color="#9CA3AF" />
            </View>
            <Text className="text-white text-lg font-bold mb-2">No Registered Events</Text>
            <Text className="text-placeholder text-center px-4">
              You haven't registered for any upcoming races yet.
            </Text>
            <TouchableOpacity 
              className="mt-6 bg-primary px-6 py-3 rounded-full"
              onPress={() => navigation.navigate('Explore')}
            >
              <Text className="text-white font-bold">Explore Races</Text>
            </TouchableOpacity>
          </View>
        ) : (
          registrations?.map((reg: any) => {
            const race = reg.race;
            const isCompleted = reg.paymentStatus === 'COMPLETED';

            return (
              <View key={reg.id} className="bg-surface rounded-2xl overflow-hidden mb-5 border border-[#243249]">
                <Image 
                  source={{ uri: race?.bibTemplateUrl || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80' }} 
                  className="h-[100px] w-full" 
                />
                <View className="p-4 flex-col gap-3">
                  <View className="flex-row items-center justify-between">
                    <View className={`px-2 py-1 rounded-md flex-row items-center gap-1 ${isCompleted ? 'bg-[#CCFF00]/10' : 'bg-[#FF4C29]/10'}`}>
                      <Feather name={isCompleted ? 'check-circle' : 'clock'} size={12} color={isCompleted ? '#CCFF00' : '#FF4C29'} />
                      <Text className={`font-bold text-xs ${isCompleted ? 'text-[#CCFF00]' : 'text-[#FF4C29]'}`}>
                        {isCompleted ? 'PAID' : 'PENDING PAYMENT'}
                      </Text>
                    </View>
                    <Text className="text-primary font-bold text-sm">KES {race?.fee}</Text>
                  </View>

                  <View>
                    <Text className="text-white font-bold text-lg mb-1">{race?.name}</Text>
                    <Text className="text-[#9CA3AF] text-sm mb-3">
                      {new Date(race?.raceDate).toLocaleDateString()} • {race?.distance}
                    </Text>
                  </View>

                  {isCompleted ? (
                    <View className="flex-row gap-2">
                      <TouchableOpacity 
                        className="flex-1 bg-[#1E2A3E] py-3 rounded-xl items-center flex-row justify-center gap-2"
                        onPress={() => navigation.navigate('DigitalBib', { registrationId: reg.id })}
                      >
                        <Feather name="credit-card" size={16} color="#fff" />
                        <Text className="text-white font-bold">Digital Bib</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        className="flex-1 bg-primary py-3 rounded-xl items-center flex-row justify-center gap-2 shadow-lg shadow-primary/20"
                        onPress={() => navigation.navigate('SubmitTime')}
                      >
                        <Feather name="upload-cloud" size={16} color="#fff" />
                        <Text className="text-white font-bold">Submit Time</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      className="w-full bg-primary py-3 rounded-xl items-center flex-row justify-center gap-2 shadow-lg shadow-primary/20"
                      onPress={() => navigation.navigate('Checkout', { raceId: race?.id })}
                    >
                      <Feather name="arrow-right-circle" size={16} color="#fff" />
                      <Text className="text-white font-bold">Complete Payment</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Bottom Nav */}
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
          <TouchableOpacity className="items-center gap-1 w-[72px]">
            <Feather name="calendar" size={22} color="#FF4C29" />
            <Text className="text-primary font-semibold text-[11px]">My Events</Text>
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
