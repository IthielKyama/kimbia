import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen({ navigation }: any) {
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
        <Text className="text-white text-lg font-bold text-center uppercase">Settings</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        
        <Text className="text-white font-bold text-base uppercase mb-4">Edit Profile</Text>

        <View className="flex-col gap-4 mb-8">
          <View className="flex-col gap-1.5">
            <Text className="text-placeholder text-[13px] font-semibold uppercase">Full Name</Text>
            <View className="bg-surface border border-[#243249] rounded-xl px-4 py-3.5">
              <TextInput className="text-white text-[15px]" defaultValue="Eliud Kipchoge" placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          <View className="flex-col gap-1.5">
            <Text className="text-placeholder text-[13px] font-semibold uppercase">Email Address</Text>
            <View className="bg-surface border border-[#243249] rounded-xl px-4 py-3.5">
              <TextInput className="text-white text-[15px]" defaultValue="eliud@runfast.com" placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          <View className="flex-col gap-1.5">
            <Text className="text-placeholder text-[13px] font-semibold uppercase">Gender</Text>
            <TouchableOpacity className="bg-surface border border-[#243249] rounded-xl px-4 py-3.5 flex-row justify-between items-center">
              <Text className="text-white text-[15px]">Male</Text>
              <Feather name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View className="flex-col gap-1.5">
            <Text className="text-placeholder text-[13px] font-semibold uppercase">Age Group</Text>
            <TouchableOpacity className="bg-surface border border-[#243249] rounded-xl px-4 py-3.5 flex-row justify-between items-center">
              <Text className="text-white text-[15px]">30 - 39</Text>
              <Feather name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity className="w-full bg-primary py-4 rounded-xl items-center justify-center mb-5">
          <Text className="text-white font-bold text-base uppercase">Save Changes</Text>
        </TouchableOpacity>

        <View className="w-full h-[1px] bg-[#243249] mb-5" />

        <TouchableOpacity 
          className="w-full border-2 border-primary py-4 rounded-xl flex-row justify-center items-center gap-2 mb-8"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
        >
          <Feather name="log-out" size={20} color="#FF4C29" />
          <Text className="text-primary font-bold text-base uppercase">Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
