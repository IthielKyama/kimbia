import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
// @ts-ignore
import './global.css';

import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import EventDetailsScreen from './src/screens/EventDetailsScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import SubmitTimeScreen from './src/screens/SubmitTimeScreen';
import DigitalBibScreen from './src/screens/DigitalBibScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import PaymentStatusScreen from './src/screens/PaymentStatusScreen';
import SubmissionSuccessScreen from './src/screens/SubmissionSuccessScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PendingRacesScreen from './src/screens/PendingRacesScreen';
import MyEventsScreen from './src/screens/MyEventsScreen';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Explore: undefined;
  EventDetails: { raceId: number, race?: any };
  Registration: undefined;
  Profile: undefined;
  Leaderboard: undefined;
  SubmitTime: { registrationId?: number; raceName?: string; distance?: string } | undefined;
  DigitalBib: { registrationId: number };
  Checkout: { raceId: number };
  PaymentStatus: { registrationId: number };
  SubmissionSuccess: { submittedTime?: string; raceName?: string } | undefined;
  Notifications: undefined;
  Settings: undefined;
  PendingRaces: undefined;
  MyEvents: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { createNavigationContainerRef } from '@react-navigation/native';
import apiClient from './src/services/apiClient';
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const queryClient = new QueryClient();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Login');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (token || refreshToken) {
          try {
            // Ping /api/users/me. If the access token is expired, the apiClient
            // interceptor will automatically trigger silent refresh via /api/auth/refresh
            await apiClient.get('/api/users/me');
            setInitialRoute('Explore');
          } catch (apiError) {
            // Both access token and refresh token failed/expired
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('refreshToken');
            setInitialRoute('Login');
          }
        } else {
          setInitialRoute('Login');
        }
      } catch (e) {
        setInitialRoute('Login');
      } finally {
        setIsReady(true);
      }
    };
    checkAuth();
  }, []);

  const linking = {
    prefixes: [Linking.createURL('/'), 'http://localhost:8081', 'https://localhost:8081'],
    config: {
      screens: {
        PaymentStatus: 'payment-status/:registrationId',
      }
    }
  };

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B0F19', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF4C29" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: '#0B0F19' }}>
          <StatusBar style="light" />
          <NavigationContainer linking={linking} ref={navigationRef}>
            <Stack.Navigator 
              id="RootStack"
              initialRouteName={initialRoute}
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0B0F19' },
                animation: 'slide_from_right' // Industry standard push animation
              }}
            >
              <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'fade' }} />
              <Stack.Screen name="SignUp" component={SignUpScreen} options={{ animation: 'fade' }} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              
              {/* Fake Tab Screens (No animation for instant switching) */}
              <Stack.Screen name="Explore" component={ExploreScreen} options={{ animation: 'none' }} />
              <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ animation: 'none' }} />
              <Stack.Screen name="MyEvents" component={MyEventsScreen} options={{ animation: 'none' }} />
              <Stack.Screen name="PendingRaces" component={PendingRacesScreen} options={{ animation: 'none' }} />
              <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'none' }} />
              
              {/* Standard Push Screens (Inherits slide_from_right) */}
              <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
              <Stack.Screen name="Registration" component={RegistrationScreen} />
              <Stack.Screen name="SubmitTime" component={SubmitTimeScreen} />
              <Stack.Screen name="DigitalBib" component={DigitalBibScreen} />
              <Stack.Screen name="Checkout" component={CheckoutScreen} />
              <Stack.Screen name="PaymentStatus" component={PaymentStatusScreen} options={{ animation: 'fade' }} />
              <Stack.Screen name="SubmissionSuccess" component={SubmissionSuccessScreen} options={{ animation: 'fade' }} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
