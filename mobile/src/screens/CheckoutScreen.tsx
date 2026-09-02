import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Platform } from 'react-native';
import * as ExpoLinking from 'expo-linking';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import React, { useState } from 'react';
import CustomAlert from '../components/CustomAlert';

type CheckoutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Checkout'>;
type CheckoutScreenRouteProp = RouteProp<RootStackParamList, 'Checkout'>;

export default function CheckoutScreen({ navigation, route }: { navigation: CheckoutScreenNavigationProp, route: CheckoutScreenRouteProp }) {
  const { raceId } = route.params;

  const { data: race, isLoading } = useQuery({
    queryKey: ['race', raceId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/races/${raceId}`);
      return response.data;
    },
  });

  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      let returnUrl = '';
      if (Platform.OS === 'web') {
        returnUrl = window.location.origin + '/payment-status/__id__'; // Drops them back into the Expo Web root tab
      } else {
        // Fallback for native devices
        returnUrl = ExpoLinking.createURL('payment-status/__id__');
      }

      const response = await apiClient.post('/api/payments/checkout', { raceId, returnUrl });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.redirectUrl) {
        Linking.openURL(data.redirectUrl).catch(err => console.error("Couldn't open Tingg checkout", err));
      }
      navigation.navigate('PaymentStatus', { registrationId: data.registrationId });
    },
    onError: (error: any) => {
      setAlertConfig({ 
        visible: true, 
        title: 'Checkout Failed', 
        message: error.response?.data?.error || 'Something went wrong processing your payment.' 
      });
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator color="#FF4C29" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-surface rounded-full items-center justify-center">
           <Feather name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-2" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Order Summary */}
        <View className="bg-surface p-5 rounded-2xl flex-col gap-3 mb-6">
          <Text className="text-white font-bold text-base uppercase">Order Summary</Text>
          <View className="flex-row justify-between w-full">
            <Text className="text-placeholder font-regular text-sm">{race?.name} Entry</Text>
            <Text className="text-white font-semibold text-sm">KES {race?.fee}</Text>
          </View>
          <View className="w-full h-[1px] bg-[#243249]" />
          <View className="flex-row justify-between items-center w-full">
            <Text className="text-white font-bold text-lg">Total Amount</Text>
            <Text className="text-[#CCFF00] font-extrabold text-[22px]">KES {race?.fee}</Text>
          </View>
        </View>

        {/* Tingg Partner */}
        <View className="bg-[#1E2A3E] p-4 rounded-xl flex-col gap-3 mb-6">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-[#E21B23] rounded-lg items-center justify-center">
              <Text className="text-white font-black text-[20px]">T</Text>
            </View>
            <View className="flex-col gap-0.5">
              <Text className="text-white font-bold text-[15px]">Powered by Tingg</Text>
              <Text className="text-placeholder font-regular text-[11px]">Pan-African Secure Checkout</Text>
            </View>
          </View>
          <Text className="text-[#9CA3AF] text-[13px] leading-5">
            You will be redirected to Tingg's secure portal to complete your payment via M-Pesa, Card, or Airtel Money.
          </Text>
        </View>

        {/* Primary Button */}
        <TouchableOpacity 
          className="w-full bg-primary py-4 rounded-xl flex-row justify-center items-center gap-2 mb-5"
          onPress={() => checkoutMutation.mutate()}
          disabled={checkoutMutation.isPending}
        >
          {checkoutMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="lock" size={20} color="#fff" />
              <Text className="text-white font-bold text-base uppercase">CONFIRM AND PAY KES {race?.fee}</Text>
            </>
          )}
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

      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </SafeAreaView>
  );
}
