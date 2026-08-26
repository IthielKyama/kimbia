import { View, Text, ScrollView, TouchableOpacity , Image} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function DigitalBibScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-2" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Bib Card */}
        <View className="bg-surface border-[4px] border-primary rounded-3xl p-6 flex-col gap-5 mb-6">
          <View className="flex-row justify-between items-center w-full">
            <Text className="text-primary font-black text-[20px]">KIMBIA</Text>
            <Text className="text-placeholder font-bold text-xs uppercase">VIRTUAL RUNNER</Text>
          </View>
          
          <View className="py-2.5 items-center w-full">
            <Text className="text-white font-black text-[72px]">1240</Text>
          </View>
          
          <View className="items-center w-full gap-1.5">
            <Text className="text-white font-extrabold text-[22px]">ELIUD KIPCHOGE</Text>
            <Text className="text-[#CCFF00] font-semibold text-sm uppercase">Rift Valley 10K Challenge</Text>
          </View>

          <View className="w-full h-[1px] bg-[#243249]" />

          <View className="flex-row justify-between items-center w-full">
            <View className="flex-col gap-1">
              <Text className="text-placeholder font-regular text-xs uppercase">Event Date</Text>
              <Text className="text-white font-bold text-sm">Oct 12-14, 2026</Text>
            </View>
            <View className="bg-white p-2 rounded-lg items-center justify-center">
              <Image source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=KIMBIA' }} className="w-[54px] h-[54px]" />
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-col gap-3 mb-5">
          <TouchableOpacity className="w-full bg-primary py-4 rounded-xl flex-row justify-center items-center gap-2">
            <Feather name="download" size={20} color="#fff" />
            <Text className="text-white font-bold text-base uppercase">DOWNLOAD PRINTABLE PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-full border-2 border-primary py-3.5 rounded-xl flex-row justify-center items-center gap-2">
            <Feather name="share-2" size={20} color="#FF4C29" />
            <Text className="text-primary font-bold text-base uppercase">SHARE TO SOCIALS</Text>
          </TouchableOpacity>
        </View>

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
