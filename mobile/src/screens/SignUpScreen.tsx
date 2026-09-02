import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Input from '../components/Input';
import Select from '../components/Select';
import CustomAlert from '../components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }
];

const AGE_GROUP_OPTIONS = [
  { value: 'UNDER_18', label: 'Under 18' },
  { value: 'AGE_18_35', label: '18 - 35' },
  { value: 'AGE_36_50', label: '36 - 50' },
  { value: 'AGE_51_65', label: '51 - 65' },
  { value: 'OVER_65', label: 'Over 65' }
];

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: { navigation: SignUpScreenNavigationProp }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); 
  const [gender, setGender] = useState('MALE'); 
  const [ageGroup, setAgeGroup] = useState('AGE_18_35');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });

  const registerMutation = useMutation({
    mutationFn: async () => {
      // Backend expects dateOfBirth. Convert DD-MM-YYYY to YYYY-MM-DD if backend expects standard ISO.
      // Assuming backend stores it as a String, we'll send it as is.
      const response = await apiClient.post('/api/auth/register', { 
        name, email, password, mobileNumber, ageGroup, gender, dateOfBirth
      });
      return response.data;
    },
    onSuccess: async (data) => {
      await AsyncStorage.setItem('token', data.token);
      navigation.navigate('Explore');
    },
    onError: (error: any) => {
      console.log('Registration Error:', error.response?.data || error.message);
      const debugMessage = error.response?.data 
        ? JSON.stringify(error.response.data) 
        : error.message;

      setAlertConfig({ 
        visible: true, 
        title: 'Registration Failed (Debug)', 
        message: debugMessage || 'Something went wrong. Please try again.' 
      });
    },
  });

  const validateForm = () => {
    let newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full Name is required';
    if (!email.trim()) newErrors.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';
    if (!mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    if (!dateOfBirth.trim() || dateOfBirth.length < 10) newErrors.dateOfBirth = 'Valid date required (DD-MM-YYYY)';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (validateForm()) {
      registerMutation.mutate();
    }
  };

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
            className="flex-row items-center gap-2 mb-4 mt-2"
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={20} color="#9CA3AF" />
            <Text className="text-placeholder font-medium">Back to Login</Text>
          </TouchableOpacity>
          {/* Logo Header */}
          <View className="items-center mb-8">
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
              value={name}
              onChangeText={setName}
              error={errors.name}
              autoCapitalize="words"
            />
            <Input 
              label="Email address" 
              iconName="mail" 
              placeholder="you@example.com" 
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />
            <Input 
              label="Mobile Number" 
              iconName="phone" 
              placeholder="0712345678" 
              keyboardType="phone-pad"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              error={errors.mobileNumber}
            />
            
            <Input 
              label="Date of Birth" 
              iconName="calendar" 
              placeholder="DD-MM-YYYY" 
              value={dateOfBirth}
              onChangeText={(text) => {
                let cleaned = text.replace(/[^0-9]/g, '');
                let formatted = cleaned;
                if (cleaned.length > 2) {
                  formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
                }
                if (cleaned.length > 4) {
                  formatted = formatted.slice(0, 5) + '-' + cleaned.slice(4, 8);
                }
                setDateOfBirth(formatted);
              }}
              keyboardType="numeric"
              maxLength={10}
              error={errors.dateOfBirth}
            />

            <Select
              label="Gender"
              iconName="user"
              options={GENDER_OPTIONS}
              value={gender}
              onChange={setGender}
            />

            <Select
              label="Age Group"
              iconName="users"
              options={AGE_GROUP_OPTIONS}
              value={ageGroup}
              onChange={setAgeGroup}
            />

            <Input 
              label="Password" 
              iconName="lock" 
              placeholder="••••••••" 
              isPassword 
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />
            <Input 
              label="Confirm Password" 
              iconName="lock" 
              placeholder="••••••••" 
              isPassword 
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
            />
          </View>

          {/* Action Buttons */}
          <View className="flex-col gap-6 mb-8">
            <TouchableOpacity 
              className="w-full h-12 bg-primary rounded-xl items-center justify-center shadow-lg shadow-primary/25"
              onPress={handleRegister}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">Get started</Text>
              )}
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

      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </SafeAreaView>
  );
}
