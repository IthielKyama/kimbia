import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

type PaymentStatusScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PaymentStatus'>;
type PaymentStatusScreenRouteProp = RouteProp<RootStackParamList, 'PaymentStatus'>;

export default function PaymentStatusScreen({ navigation, route }: { navigation: PaymentStatusScreenNavigationProp, route: PaymentStatusScreenRouteProp }) {
  const { registrationId } = route.params;

  const { data: statusResponse } = useQuery({
    queryKey: ['paymentStatus', registrationId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/registrations/${registrationId}/status`);
      return response.data;
    },
    refetchInterval: (query) => {
      return (query.state.data?.paymentStatus === 'COMPLETED' || query.state.data?.paymentStatus === 'FAILED') ? false : 2000;
    },
  });

  useEffect(() => {
    if (statusResponse?.paymentStatus === 'COMPLETED') {
      // Small delay for better UX
      const timer = setTimeout(() => {
        navigation.replace('DigitalBib', { registrationId });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [statusResponse, navigation, registrationId]);

  return (
    <SafeAreaViewContext className="flex-1 bg-background">
      <StatusBar style="light" />
      <View className="flex-1 items-center justify-center px-5">
        <View className="w-24 h-24 bg-surface rounded-full items-center justify-center mb-6">
          {statusResponse?.paymentStatus === 'COMPLETED' ? (
            <Feather name="check" size={48} color="#CCFF00" />
          ) : statusResponse?.paymentStatus === 'FAILED' ? (
            <Feather name="x" size={48} color="#FF4C29" />
          ) : (
            <ActivityIndicator size="large" color="#FF4C29" />
          )}
        </View>
        <Text className="text-white text-2xl font-extrabold mb-3 text-center">
          {statusResponse?.paymentStatus === 'COMPLETED' 
            ? 'Payment Successful' 
            : statusResponse?.paymentStatus === 'FAILED'
            ? 'Payment Failed'
            : 'Processing Payment'}
        </Text>
        <Text className="text-placeholder text-[15px] text-center leading-6 max-w-[280px]">
          {statusResponse?.paymentStatus === 'COMPLETED'
            ? 'Your transaction was confirmed.'
            : statusResponse?.paymentStatus === 'FAILED'
            ? 'There was an issue processing your payment.'
            : 'Please wait while we confirm your transaction securely with Tingg...'}
        </Text>
        
        {/* LOCAL DEV ONLY */}
        {statusResponse?.paymentStatus === 'PENDING' && (
          <TouchableOpacity 
            className="mt-6 border border-primary px-4 py-2 rounded-lg opacity-50"
            onPress={async () => {
              try {
                await apiClient.get(`/api/payments/simulate/${registrationId}`);
              } catch (e) {
                console.error(e);
              }
            }}
          >
            <Text className="text-primary text-xs font-bold uppercase">Simulate Success (Local Dev)</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaViewContext>
  );
}
