import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SubmissionSuccessScreen({ navigation, route }: any) {
  const submittedTime = route?.params?.submittedTime;
  const raceName = route?.params?.raceName;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      <View className="flex-1 items-center justify-center px-5">
        <View className="w-24 h-24 bg-surface rounded-full items-center justify-center mb-6 border-4 border-[#CCFF00]">
          <Feather name="check" size={48} color="#CCFF00" />
        </View>
        <Text className="text-white text-2xl font-extrabold mb-2 text-center uppercase">Time Submitted!</Text>
        
        {submittedTime && (
          <View className="bg-surface border border-[#243249] px-5 py-2.5 rounded-xl mb-4 items-center">
            <Text className="text-placeholder text-xs uppercase font-bold tracking-wider">Submitted Finishing Time</Text>
            <Text className="text-[#CCFF00] font-mono font-extrabold text-2xl mt-0.5">{submittedTime}</Text>
            {raceName && <Text className="text-white text-xs mt-0.5">{raceName}</Text>}
          </View>
        )}

        <Text className="text-placeholder text-[15px] text-center leading-6 mb-8 max-w-[280px]">
          Your verified run is under review. The leaderboard will be updated shortly!
        </Text>

        <TouchableOpacity 
          className="w-full bg-primary py-4 rounded-xl flex-row justify-center items-center gap-2 mb-4"
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Feather name="award" size={20} color="#fff" />
          <Text className="text-white font-bold text-base uppercase">View Leaderboard</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-full border-2 border-[#243249] py-3.5 rounded-xl flex-row justify-center items-center gap-2"
          onPress={() => navigation.navigate('Explore')}
        >
          <Feather name="home" size={20} color="#9CA3AF" />
          <Text className="text-placeholder font-bold text-base uppercase">Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
