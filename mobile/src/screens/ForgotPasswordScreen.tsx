import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Input from '../components/Input';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: { navigation: ForgotPasswordScreenNavigationProp }) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
          {/* Back Button */}
          <TouchableOpacity 
            className="flex-row items-center gap-2 mt-4 mb-8"
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={20} color="#9CA3AF" />
            <Text className="text-placeholder font-semibold text-sm">Back to sign in</Text>
          </TouchableOpacity>

          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-white text-2xl font-bold text-center mb-4">
              Reset your password
            </Text>
            <Text className="text-placeholder text-[15px] text-center px-2 leading-6">
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-6 mb-8 flex-col gap-6">
            <Input 
              label="Email address" 
              iconName="mail" 
              placeholder="you@example.com" 
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TouchableOpacity className="w-full h-12 bg-primary rounded-xl items-center justify-center shadow-lg shadow-primary/25">
              <Text className="text-white font-semibold text-base">Send reset link</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
        
        {/* Footer */}
        <View className="px-8 pb-8">
          <Text className="text-placeholder text-[13px] text-center leading-5">
            Can't access your email? Contact our support team for help recovery options.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
