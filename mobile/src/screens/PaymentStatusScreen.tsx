import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';

export default function PaymentStatusScreen({ navigation }: any) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('DigitalBib');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaViewContext className="flex-1 bg-background">
      <StatusBar style="light" />
      <View className="flex-1 items-center justify-center px-5">
        <View className="w-24 h-24 bg-surface rounded-full items-center justify-center mb-6">
          <ActivityIndicator size="large" color="#FF4C29" />
        </View>
        <Text className="text-white text-2xl font-extrabold mb-3 text-center">Processing Payment</Text>
        <Text className="text-placeholder text-[15px] text-center leading-6 max-w-[280px]">
          Please wait while we confirm your transaction securely with Tingg...
        </Text>
      </View>
    </SafeAreaViewContext>
  );
}
