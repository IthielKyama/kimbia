import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function LeaderboardScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="w-10 h-10" />
        <Text className="text-white text-lg font-bold text-center">LEADERBOARD</Text>
        <View className="w-10 h-10" />
      </View>

      <View className="flex-1 px-5 pt-2 pb-5 flex-col gap-5">
        {/* Race Select Dropdown */}
        <TouchableOpacity className="bg-surface rounded-xl p-3.5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Feather name="award" size={20} color="#fff" />
            <Text className="text-white font-bold text-base">Rift Valley 10K Challenge</Text>
          </View>
          <Feather name="chevron-down" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 max-h-9 min-h-[36px]">
          <TouchableOpacity className="bg-primary px-3 py-2 rounded-lg mr-2 justify-center">
            <Text className="text-white font-bold text-xs">Overall</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-surface px-3 py-2 rounded-lg mr-2 justify-center">
            <Text className="text-white font-bold text-xs">Men</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-surface px-3 py-2 rounded-lg mr-2 justify-center">
            <Text className="text-white font-bold text-xs">Women</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-surface px-3 py-2 rounded-lg justify-center">
            <Text className="text-white font-bold text-xs">Age 30-39</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Table Header */}
        <View className="flex-row items-center px-3 py-1 gap-3">
          <Text className="w-[34px] text-placeholder text-xs font-regular">RANK</Text>
          <Text className="flex-1 text-placeholder text-xs font-regular">RUNNER</Text>
          <Text className="w-[80px] text-placeholder text-xs font-regular text-right">TIME</Text>
          <Text className="w-[70px] text-placeholder text-xs font-regular text-right">PACE</Text>
        </View>

        {/* Leaderboard Rows */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-col gap-2 pb-24">
            
            {/* Row 1 */}
            <View className="bg-surface rounded-xl p-3 flex-row items-center gap-3">
              <View className="w-[30px] items-center justify-center">
                <Text className="text-white font-bold text-sm">1</Text>
              </View>
              <View className="flex-1 flex-row items-center gap-2">
                <Text className="text-white font-bold text-sm">Kiplimo Mutai</Text>
                <Feather name="check-circle" size={14} color="#fff" />
              </View>
              <Text className="w-[80px] text-white font-bold text-sm text-right">00:38:12</Text>
              <Text className="w-[70px] text-placeholder text-[13px] text-right">3:49 /km</Text>
            </View>

            {/* Row 2 */}
            <View className="bg-surface rounded-xl p-3 flex-row items-center gap-3">
              <View className="w-[30px] items-center justify-center">
                <Text className="text-white font-bold text-sm">2</Text>
              </View>
              <View className="flex-1 flex-row items-center gap-2">
                <Text className="text-white font-bold text-sm">David Rudisha</Text>
                <Feather name="check-circle" size={14} color="#fff" />
              </View>
              <Text className="w-[80px] text-white font-bold text-sm text-right">00:39:45</Text>
              <Text className="w-[70px] text-placeholder text-[13px] text-right">3:58 /km</Text>
            </View>

            {/* Row 3 */}
            <View className="bg-surface rounded-xl p-3 flex-row items-center gap-3">
              <View className="w-[30px] items-center justify-center">
                <Text className="text-white font-bold text-sm">3</Text>
              </View>
              <View className="flex-1 flex-row items-center gap-2">
                <Text className="text-white font-bold text-sm">Joyciline Jepkosgei</Text>
                <Feather name="check-circle" size={14} color="#fff" />
              </View>
              <Text className="w-[80px] text-white font-bold text-sm text-right">00:40:02</Text>
              <Text className="w-[70px] text-placeholder text-[13px] text-right">4:00 /km</Text>
            </View>

            {/* Row 4 (Current User Highlighted) */}
            <View className="bg-[#1E2A3E] border-[1.5px] border-primary rounded-xl p-3 flex-row items-center gap-3">
              <View className="w-[30px] items-center justify-center">
                <Text className="text-white font-bold text-sm">4</Text>
              </View>
              <View className="flex-1 flex-row items-center gap-2">
                <Text className="text-white font-bold text-sm">Eliud Kipchoge (You)</Text>
                <Feather name="check-circle" size={14} color="#fff" />
              </View>
              <Text className="w-[80px] text-white font-bold text-sm text-right">00:41:24</Text>
              <Text className="w-[70px] text-placeholder text-[13px] text-right">4:08 /km</Text>
            </View>

            {/* Row 5 */}
            <View className="bg-surface rounded-xl p-3 flex-row items-center gap-3">
              <View className="w-[30px] items-center justify-center">
                <Text className="text-white font-bold text-sm">5</Text>
              </View>
              <View className="flex-1 flex-row items-center gap-2">
                <Text className="text-white font-bold text-sm">Florence Kiplagat</Text>
              </View>
              <Text className="w-[80px] text-white font-bold text-sm text-right">00:42:15</Text>
              <Text className="w-[70px] text-placeholder text-[13px] text-right">4:13 /km</Text>
            </View>

          </View>
        </ScrollView>
      </View>

                              {/* Bottom Nav Placeholder */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-[#243249]">
        <View className="flex-row items-center justify-between px-4 pt-3 pb-6">
          <TouchableOpacity className="items-center gap-1 w-[72px]" onPress={() => navigation.navigate('Explore')}>
            <Feather name="compass" size={22} color="#9CA3AF" />
            <Text className="text-[#9CA3AF] font-semibold text-[11px]">Explore</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center gap-1 w-[72px]" onPress={() => navigation.navigate('Leaderboard')}>
            <Feather name="award" size={22} color="#FF4C29" />
            <Text className="text-primary font-semibold text-[11px]">Leaderboard</Text>
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
