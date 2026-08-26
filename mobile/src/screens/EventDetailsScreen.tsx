import { View, Text, ScrollView, TouchableOpacity , Image} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type EventDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EventDetails'>;

export default function EventDetailsScreen({ navigation }: { navigation: EventDetailsScreenNavigationProp }) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Visual */}
        <View className="h-[200px] bg-surface rounded-2xl mb-5 relative">
          <Image source={{ uri: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80' }} className="absolute inset-0 w-full h-full rounded-2xl" resizeMode="cover" />
          <View className="absolute inset-0 bg-black/30 z-10 rounded-2xl" />
          <View className="flex-1 p-4 justify-start z-20">
            <View className="self-start bg-primary px-3 py-1.5 rounded-lg">
              <Text className="text-white text-sm font-extrabold">10K RUN</Text>
            </View>
          </View>
        </View>

        {/* Info Grid */}
        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 bg-surface p-3 rounded-xl flex-col gap-1">
            <Text className="text-placeholder text-xs uppercase">Date</Text>
            <Text className="text-white font-bold text-[15px]">Oct 12 - 14</Text>
          </View>
          <View className="flex-1 bg-surface p-3 rounded-xl flex-col gap-1">
            <Text className="text-placeholder text-xs uppercase">Entry Fee</Text>
            <Text className="text-[#CCFF00] font-bold text-[15px]">KES 1,500</Text>
          </View>
          <View className="flex-1 bg-surface p-3 rounded-xl flex-col gap-1">
            <Text className="text-placeholder text-xs uppercase">Elevation</Text>
            <Text className="text-white font-bold text-[15px]">+180m</Text>
          </View>
        </View>

        {/* Title Block */}
        <View className="flex-col gap-1.5 mb-5">
          <Text className="text-white font-extrabold text-2xl">Rift Valley 10K Challenge</Text>
          <Text className="text-primary font-semibold text-sm">Organized by Kimbia Athletics</Text>
        </View>

        {/* Section: About */}
        <View className="flex-col gap-2 mb-5">
          <Text className="text-white font-bold text-base uppercase">About the Race</Text>
          <Text className="text-placeholder text-sm leading-6">
            Run virtually from anywhere in the world and trace the spirit of the Rift Valley. You can log your run via GPS/Strava on your favorite local trail, track, or treadmill between Oct 12 and 14.
          </Text>
        </View>

        {/* Section: Rules */}
        <View className="flex-col gap-2 mb-5">
          <Text className="text-white font-bold text-base uppercase">Rules & Verification</Text>
          <View className="flex-col gap-1.5">
            <View className="flex-row gap-2">
              <Feather name="check-circle" size={16} color="#9CA3AF" className="mt-0.5" />
              <Text className="text-placeholder text-[13px] flex-1">Time tracking must be completed in a single session.</Text>
            </View>
            <View className="flex-row gap-2">
              <Feather name="check-circle" size={16} color="#9CA3AF" className="mt-0.5" />
              <Text className="text-placeholder text-[13px] flex-1">Upload GPX / Strava file or a clear photo of your GPS smartwatch.</Text>
            </View>
            <View className="flex-row gap-2">
              <Feather name="check-circle" size={16} color="#9CA3AF" className="mt-0.5" />
              <Text className="text-placeholder text-[13px] flex-1">Submit final elapsed time before Oct 14, 11:59 PM GMT.</Text>
            </View>
          </View>
        </View>

        {/* Section: Swag */}
        <View className="flex-col gap-2 mb-5">
          <Text className="text-white font-bold text-base uppercase">What You'll Earn</Text>
          <View className="bg-surface p-3 rounded-xl flex-row items-center gap-3">
            <Feather name="award" size={32} color="#FF4C29" />
            <Text className="text-white font-bold text-[15px]">Personalized Digital Bib</Text>
          </View>
        </View>

        {/* Register Button */}
        <TouchableOpacity 
          className="w-full bg-primary py-4 rounded-xl flex-row justify-center items-center gap-2 mb-5"
          onPress={() => navigation.navigate('Registration')}
        >
          <Feather name="zap" size={20} color="#fff" />
          <Text className="text-white font-bold text-base uppercase">REGISTER NOW</Text>
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
