import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function CheckoutScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-2" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Order Summary */}
        <View className="bg-surface p-5 rounded-2xl flex-col gap-3 mb-6">
          <Text className="text-white font-bold text-base uppercase">Order Summary</Text>
          <View className="flex-row justify-between w-full">
            <Text className="text-placeholder font-regular text-sm">Rift Valley 10K Entry</Text>
            <Text className="text-white font-semibold text-sm">KES 1,500</Text>
          </View>
          <View className="w-full h-[1px] bg-[#243249]" />
          <View className="flex-row justify-between items-center w-full">
            <Text className="text-white font-bold text-lg">Total Amount</Text>
            <Text className="text-[#CCFF00] font-extrabold text-[22px]">KES 1,500</Text>
          </View>
        </View>

        {/* Tingg Partner */}
        <View className="bg-[#1E2A3E] p-3 rounded-xl flex-row items-center gap-3 mb-6">
          <View className="w-10 h-10 bg-[#E21B23] rounded-lg items-center justify-center">
            <Text className="text-white font-black text-[20px]">T</Text>
          </View>
          <View className="flex-col gap-0.5">
            <Text className="text-white font-bold text-[15px]">Powered by Tingg</Text>
            <Text className="text-placeholder font-regular text-[11px]">Pan-African secure payment checkout system</Text>
          </View>
        </View>

        {/* Methods Section */}
        <View className="flex-col gap-3 mb-6">
          <Text className="text-white font-bold text-base uppercase">Select Payment Option</Text>
          
          <TouchableOpacity className="bg-surface border-2 border-primary rounded-xl p-4 flex-row justify-between items-center">
            <View className="flex-row items-center gap-3">
              <View className="w-6 h-6 bg-[#1E2A3E] rounded" />
              <Text className="text-white font-bold text-[15px]">M-Pesa (Kenya)</Text>
            </View>
            <View className="w-5 h-5 border-2 border-primary rounded-full items-center justify-center">
              <View className="w-2.5 h-2.5 bg-primary rounded-full" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-surface border-2 border-[#243249] rounded-xl p-4 flex-row justify-between items-center">
            <View className="flex-row items-center gap-3">
              <View className="w-6 h-6 bg-[#1E2A3E] rounded" />
              <Text className="text-white font-bold text-[15px]">Airtel Money (Kenya/Tanzania)</Text>
            </View>
            <View className="w-5 h-5 border-2 border-[#9CA3AF] rounded-full" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-surface border-2 border-[#243249] rounded-xl p-4 flex-row justify-between items-center">
            <View className="flex-row items-center gap-3">
              <View className="w-6 h-6 bg-[#1E2A3E] rounded" />
              <Text className="text-white font-bold text-[15px]">Card Payment (Visa/Mastercard)</Text>
            </View>
            <View className="w-5 h-5 border-2 border-[#9CA3AF] rounded-full" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-surface border-2 border-[#243249] rounded-xl p-4 flex-row justify-between items-center">
            <View className="flex-row items-center gap-3">
              <View className="w-6 h-6 bg-[#1E2A3E] rounded" />
              <Text className="text-white font-bold text-[15px]">Bank Transfer</Text>
            </View>
            <View className="w-5 h-5 border-2 border-[#9CA3AF] rounded-full" />
          </TouchableOpacity>
        </View>

        {/* Primary Button */}
        <TouchableOpacity 
          className="w-full bg-primary py-4 rounded-xl flex-row justify-center items-center gap-2 mb-5"
          onPress={() => navigation.navigate('PaymentStatus')}
        >
          <Feather name="lock" size={20} color="#fff" />
          <Text className="text-white font-bold text-base uppercase">CONFIRM AND PAY KES 1,500</Text>
        </TouchableOpacity>
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
          <TouchableOpacity className="items-center gap-1 w-[72px]" onPress={() => navigation.navigate('PendingRaces')}>
            <Feather name="plus-circle" size={22} color="#9CA3AF" />
            <Text className="text-[#9CA3AF] font-semibold text-[11px]">Submit</Text>
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
