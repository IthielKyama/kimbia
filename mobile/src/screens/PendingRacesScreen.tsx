import React from 'react';
import { View, Text, ScrollView, TouchableOpacity , Image} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PendingRacesScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="w-10 h-10" />
        <Text className="text-white text-lg font-bold text-center uppercase">Select Event</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        
        <Text className="text-placeholder text-[15px] leading-6 mb-5">
          Select an active event to submit your verified time and proof.
        </Text>

        <TouchableOpacity 
          className="bg-surface rounded-2xl p-4 flex-row items-center gap-4 mb-4 border border-[#243249]"
          onPress={() => navigation.navigate('SubmitTime')}
        >
          <Image source={{ uri: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80' }} className="w-14 h-14 rounded-xl" />
          <View className="flex-1 flex-col gap-1">
            <Text className="text-white font-bold text-base">Rift Valley 10K Challenge</Text>
            <View className="bg-[#1E2A3E] self-start px-2 py-1 rounded-md mt-1">
              <Text className="text-[#CCFF00] font-bold text-[10px] uppercase">Ready for Submission</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-surface rounded-2xl p-4 flex-row items-center gap-4 opacity-50"
          disabled
        >
          <Image source={{ uri: 'https://images.unsplash.com/photo-1505051508008-923feaf90180?auto=format&fit=crop&w=800&q=80' }} className="w-14 h-14 rounded-xl" />
          <View className="flex-1 flex-col gap-1">
            <Text className="text-white font-bold text-base">Nairobi Midnight Half</Text>
            <View className="bg-[#1E2A3E] self-start px-2 py-1 rounded-md mt-1">
              <Text className="text-primary font-bold text-[10px] uppercase">Opens Nov 02</Text>
            </View>
          </View>
          <Feather name="lock" size={20} color="#9CA3AF" />
        </TouchableOpacity>

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
          <TouchableOpacity className="items-center gap-1 w-[72px]" onPress={() => navigation.navigate('PendingRaces')}>
            <Feather name="plus-circle" size={22} color="#FF4C29" />
            <Text className="text-primary font-semibold text-[11px]">Submit</Text>
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
