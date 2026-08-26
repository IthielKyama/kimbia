import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Input from '../components/Input';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: { navigation: SignUpScreenNavigationProp }) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
          {/* Logo Header */}
          <View className="items-center mb-8 mt-4">
            <View className="flex-row items-center mb-6">
              <Feather name="zap" size={24} color="#FF4C29" />
              <Text className="text-white text-[22px] font-extrabold ml-2 tracking-wider">
                KIMBIA
              </Text>
            </View>
            <Text className="text-white text-2xl font-bold text-center">
              Create an account
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-4 flex-col gap-4 mb-8">
            <Input 
              label="Full Name" 
              iconName="user" 
              placeholder="John Doe" 
            />
            <Input 
              label="Email address" 
              iconName="mail" 
              placeholder="you@example.com" 
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input 
              label="Mobile Number" 
              iconName="phone" 
              placeholder="0712345678" 
              keyboardType="phone-pad"
            />
            
            <Input 
              label="Date of Birth" 
              iconName="calendar" 
              placeholder="DD / MM / YYYY" 
            />

            <View className="flex-col w-full space-y-2 mb-4">
              <Text className="text-white font-semibold text-sm mb-2">Gender</Text>
              <TouchableOpacity className="flex-row items-center bg-surface px-4 py-3 rounded-xl border border-gray-700 justify-between">
                <View className="flex-row items-center">
                  <Feather name="user" size={18} color="#9CA3AF" />
                  <Text className="ml-3 text-placeholder text-[15px]">Select Gender</Text>
                </View>
                <Feather name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View className="flex-col w-full space-y-2 mb-4">
              <Text className="text-white font-semibold text-sm mb-2">Age Group</Text>
              <TouchableOpacity className="flex-row items-center bg-surface px-4 py-3 rounded-xl border border-gray-700 justify-between">
                <View className="flex-row items-center">
                  <Feather name="user" size={18} color="#9CA3AF" />
                  <Text className="ml-3 text-placeholder text-[15px]">Select Age Group</Text>
                </View>
                <Feather name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Input 
              label="Password" 
              iconName="lock" 
              placeholder="••••••••" 
              isPassword 
            />
            <Input 
              label="Confirm Password" 
              iconName="lock" 
              placeholder="••••••••" 
              isPassword 
            />
          </View>

          {/* Action Buttons */}
          <View className="flex-col gap-6 mb-8">
            <TouchableOpacity className="w-full h-12 bg-primary rounded-xl items-center justify-center shadow-lg shadow-primary/25">
              <Text className="text-white font-semibold text-base">Get started</Text>
            </TouchableOpacity>

            <View className="flex-row items-center w-full my-2">
              <View className="flex-1 h-[1px] bg-gray-800" />
              <Text className="text-placeholder px-4 text-[13px] font-medium">or sign up with</Text>
              <View className="flex-1 h-[1px] bg-gray-800" />
            </View>

            <TouchableOpacity className="w-full h-12 bg-surface rounded-xl border border-gray-700 flex-row items-center justify-center gap-2">
              {/* Note: Google logo SVG would go here */}
              <Feather name="globe" size={18} color="#fff" />
              <Text className="text-white font-semibold text-sm">Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center items-center pb-8 gap-1">
            <Text className="text-placeholder text-sm">Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-primary font-semibold text-sm">Sign in</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
