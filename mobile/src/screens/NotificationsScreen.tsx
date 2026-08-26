import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <TouchableOpacity 
          className="w-10 h-10 bg-surface rounded-full items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold text-center uppercase">Notifications</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Notification 1 (Prize) */}
        <View className="bg-[#1E2A3E] border border-primary p-4 rounded-xl flex-row gap-4 items-start mb-4">
          <View className="w-10 h-10 bg-primary rounded-full items-center justify-center mt-1">
            <Feather name="gift" size={20} color="#fff" />
          </View>
          <View className="flex-1 flex-col gap-1">
            <Text className="text-white font-bold text-[15px]">You've won a prize!</Text>
            <Text className="text-placeholder text-[13px] leading-5">
              Congratulations! You placed #4 in the Rift Valley 10K and have been awarded KES 500 Airtime.
            </Text>
            <Text className="text-primary font-bold text-[11px] mt-1">2 HOURS AGO</Text>
          </View>
        </View>

        {/* Notification 2 (Verification) */}
        <View className="bg-surface p-4 rounded-xl flex-row gap-4 items-start mb-4">
          <View className="w-10 h-10 bg-[#243249] rounded-full items-center justify-center mt-1">
            <Feather name="check-circle" size={20} color="#CCFF00" />
          </View>
          <View className="flex-1 flex-col gap-1">
            <Text className="text-white font-bold text-[15px]">Time Verified</Text>
            <Text className="text-placeholder text-[13px] leading-5">
              Your submission of 00:41:24 for the Rift Valley 10K has been successfully verified.
            </Text>
            <Text className="text-[#9CA3AF] font-bold text-[11px] mt-1">1 DAY AGO</Text>
          </View>
        </View>

        {/* Notification 3 (Event Reminder) */}
        <View className="bg-surface p-4 rounded-xl flex-row gap-4 items-start mb-4">
          <View className="w-10 h-10 bg-[#243249] rounded-full items-center justify-center mt-1">
            <Feather name="calendar" size={20} color="#fff" />
          </View>
          <View className="flex-1 flex-col gap-1">
            <Text className="text-white font-bold text-[15px]">Race Starts Tomorrow</Text>
            <Text className="text-placeholder text-[13px] leading-5">
              The Nairobi Midnight Half begins tomorrow at 11:59 PM. Don't forget to track your run!
            </Text>
            <Text className="text-[#9CA3AF] font-bold text-[11px] mt-1">3 DAYS AGO</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
