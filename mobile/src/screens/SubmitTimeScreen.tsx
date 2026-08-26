import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function SubmitTimeScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="w-10 h-10" />
        <Text className="text-white text-lg font-bold text-center">SUBMIT TIME</Text>
        <View className="w-10 h-10" />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* Event Widget */}
          <View className="bg-surface p-4 rounded-2xl flex-row gap-3 items-center mb-5 mt-2">
            <View className="w-[60px] h-[60px] bg-gray-800 rounded-xl" />
            <View className="flex-col gap-1">
              <Text className="text-white font-bold text-base">Rift Valley 10K Challenge</Text>
              <Text className="text-[#CCFF00] font-bold text-xs">Verified Distance: 10.00 KM</Text>
            </View>
          </View>

          {/* Time to Submission Deadline */}
          <View className="flex-col gap-2 mb-5">
            <Text className="text-placeholder font-semibold text-[13px] uppercase">time to submission deadline</Text>
            <View className="flex-row gap-3">
              <View className="flex-col items-center bg-[#1E2A3E] border border-[#243249] rounded-xl p-3 flex-1">
                <Text className="text-white font-extrabold text-2xl">00</Text>
                <Text className="text-placeholder text-[10px] uppercase">HRS</Text>
              </View>
              <View className="flex-col items-center bg-[#1E2A3E] border border-[#243249] rounded-xl p-3 flex-1">
                <Text className="text-white font-extrabold text-2xl">41</Text>
                <Text className="text-placeholder text-[10px] uppercase">MINS</Text>
              </View>
              <View className="flex-col items-center bg-[#1E2A3E] border border-[#243249] rounded-xl p-3 flex-1">
                <Text className="text-white font-extrabold text-2xl">24</Text>
                <Text className="text-placeholder text-[10px] uppercase">SECS</Text>
              </View>
            </View>
          </View>

          {/* Your Race Time Input */}
          <View className="flex-col gap-2 mb-5">
            <Text className="text-placeholder font-semibold text-[13px] uppercase">your race time</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-col items-center bg-[#1E2A3E] border border-[#243249] rounded-xl p-3 w-[100px]">
                <TextInput className="text-white font-extrabold text-2xl text-center" placeholder="00" placeholderTextColor="#9CA3AF" keyboardType="number-pad" />
                <Text className="text-placeholder text-[10px] uppercase">HRS</Text>
              </View>
              <Text className="text-placeholder font-extrabold text-2xl">:</Text>
              <View className="flex-col items-center bg-[#1E2A3E] border border-[#243249] rounded-xl p-3 w-[100px]">
                <TextInput className="text-white font-extrabold text-2xl text-center" placeholder="00" placeholderTextColor="#9CA3AF" keyboardType="number-pad" />
                <Text className="text-placeholder text-[10px] uppercase">MINS</Text>
              </View>
              <Text className="text-placeholder font-extrabold text-2xl">:</Text>
              <View className="flex-col items-center bg-[#1E2A3E] border border-[#243249] rounded-xl p-3 w-[100px]">
                <TextInput className="text-white font-extrabold text-2xl text-center" placeholder="00" placeholderTextColor="#9CA3AF" keyboardType="number-pad" />
                <Text className="text-placeholder text-[10px] uppercase">SECS</Text>
              </View>
            </View>
          </View>

          {/* Photo Upload */}
          <View className="bg-surface border border-[#243249] rounded-2xl p-5 flex-col items-center gap-3 mb-5">
            <Feather name="camera" size={32} color="#fff" />
            <View className="flex-col items-center gap-1">
              <Text className="text-white font-bold text-[15px]">Upload Watch Screen / Photo Proof</Text>
              <Text className="text-placeholder text-xs text-center">Snap or select a photo of your sports watch or running app screen.</Text>
            </View>
            <TouchableOpacity className="bg-[#1E2A3E] px-4 py-2 rounded-lg mt-1">
              <Text className="text-white font-bold text-[13px]">Choose File</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            className="w-full bg-primary py-4 rounded-xl flex-row justify-center items-center gap-2 mb-5"
            onPress={() => navigation.navigate('SubmissionSuccess')}
          >
            <Feather name="check-circle" size={20} color="#fff" />
            <Text className="text-white font-bold text-base uppercase">SUBMIT VERIFIED RUN</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

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
