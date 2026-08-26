import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
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

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Explore: undefined;
  EventDetails: undefined;
  Registration: undefined;
  Profile: undefined;
  Leaderboard: undefined;
  SubmitTime: undefined;
  DigitalBib: undefined;
  Checkout: undefined;
  PaymentStatus: undefined;
  SubmissionSuccess: undefined;
  Notifications: undefined;
  Settings: undefined;
  PendingRaces: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#0B0F19' }}>
        <StatusBar style="light" />
        <NavigationContainer>
          <Stack.Navigator 
            id="RootStack"
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0B0F19' }
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="Explore" component={ExploreScreen} />
            <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
            <Stack.Screen name="Registration" component={RegistrationScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="SubmitTime" component={SubmitTimeScreen} />
            <Stack.Screen name="DigitalBib" component={DigitalBibScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="PaymentStatus" component={PaymentStatusScreen} />
            <Stack.Screen name="SubmissionSuccess" component={SubmissionSuccessScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="PendingRaces" component={PendingRacesScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
