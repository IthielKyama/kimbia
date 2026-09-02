import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform , Image} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type RegistrationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Registration'>;

export default function RegistrationScreen({ navigation }: { navigation: RegistrationScreenNavigationProp }) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-surface rounded-full items-center justify-center">
           <Feather name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Event Summary */}
          <View className="bg-surface p-3 rounded-xl flex-row items-center gap-3 mb-5">
            <Image source={{ uri: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80' }} className="w-12 h-12 rounded-lg" />
            <View className="flex-col gap-0.5">
              <Text className="text-white font-bold text-base">Rift Valley 10K Challenge</Text>
              <Text className="text-placeholder text-xs">Oct 12 - 14, 2026</Text>
            </View>
          </View>

          {/* Form Fields */}
          <View className="flex-col gap-4 mb-4">
            <View className="flex-col gap-1.5">
              <Text className="text-placeholder text-[13px] font-semibold uppercase">Full Name</Text>
              <View className="bg-surface border border-[#243249] rounded-xl px-4 py-3.5">
                <TextInput 
                  className="text-placeholder text-[15px]" 
                  placeholder="Eliud Kipchoge" 
                  placeholderTextColor="#9CA3AF" 
                />
              </View>
            </View>

            <View className="flex-col gap-1.5">
              <Text className="text-placeholder text-[13px] font-semibold uppercase">Email Address</Text>
              <View className="bg-surface border border-[#243249] rounded-xl px-4 py-3.5">
                <TextInput 
                  className="text-placeholder text-[15px]" 
                  placeholder="eliud@runfast.com" 
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View className="flex-col gap-1.5">
              <Text className="text-placeholder text-[13px] font-semibold uppercase">Phone Number</Text>
              <View className="bg-surface border border-[#243249] rounded-xl px-4 py-3.5">
                <TextInput 
                  className="text-placeholder text-[15px]" 
                  placeholder="+254 712 345 678" 
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View className="flex-col gap-1.5">
              <Text className="text-placeholder text-[13px] font-semibold uppercase">Gender</Text>
              <TouchableOpacity className="bg-surface border border-[#243249] rounded-xl px-4 py-3.5 flex-row justify-between items-center">
                <Text className="text-placeholder text-[15px]">Select Gender</Text>
                <Feather name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View className="flex-col gap-1.5">
              <Text className="text-placeholder text-[13px] font-semibold uppercase">Age Group</Text>
              <TouchableOpacity className="bg-surface border border-[#243249] rounded-xl px-4 py-3.5 flex-row justify-between items-center">
                <Text className="text-placeholder text-[15px]">Select Age Group</Text>
                <Feather name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View className="flex-col gap-1.5">
              <Text className="text-placeholder text-[13px] font-semibold uppercase">Emergency Contact Name</Text>
              <View className="bg-surface border border-[#243249] rounded-xl px-4 py-3.5">
                <TextInput 
                  className="text-placeholder text-[15px]" 
                  placeholder="Mary Kipchoge" 
                  placeholderTextColor="#9CA3AF" 
                />
              </View>
            </View>

            <View className="flex-col gap-1.5">
              <Text className="text-placeholder text-[13px] font-semibold uppercase">Emergency Contact Phone</Text>
              <View className="bg-surface border border-[#243249] rounded-xl px-4 py-3.5">
                <TextInput 
                  className="text-placeholder text-[15px]" 
                  placeholder="+254 789 654 321" 
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Terms Checkbox */}
          <View className="flex-row items-start gap-3 pt-2 mb-5">
            <TouchableOpacity className="w-6 h-6 bg-primary rounded-md items-center justify-center mt-0.5">
              <Feather name="check" size={14} color="#fff" />
            </TouchableOpacity>
            <Text className="flex-1 text-placeholder text-[13px] leading-5">
              I agree to the virtual race <Text className="text-primary font-bold">Liability Waiver</Text> and terms of physical safety participation.
            </Text>
          </View>

          {/* Proceed Button */}
          <TouchableOpacity 
            className="w-full bg-primary py-4 rounded-xl items-center justify-center mb-5"
            onPress={() => navigation.navigate('Checkout')}
          >
            <Text className="text-white font-bold text-base uppercase">PROCEED TO PAYMENT</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

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
