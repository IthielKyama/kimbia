import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Input from '../components/Input';
import CustomAlert from '../components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: { navigation: LoginScreenNavigationProp }) {
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/api/auth/login', { email, password });
      return response.data;
    },
    onSuccess: async (data) => {
      const activeToken = data.accessToken || data.token;
      await AsyncStorage.setItem('token', activeToken);
      if (data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
      }
      navigation.reset({
        index: 0,
        routes: [{ name: 'Explore' }],
      });
    },
    onError: (error: any) => {
      console.log('Login Error:', error.response?.data || error.message);
      const debugMessage = error.response?.data 
        ? JSON.stringify(error.response.data) 
        : error.message;

      setAlertConfig({ 
        visible: true, 
        title: 'Login Failed (Debug)', 
        message: debugMessage || 'Invalid email or password.' 
      });
    },
  });

  const validateForm = () => {
    let newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'Email address is required';
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (validateForm()) {
      loginMutation.mutate();
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
          {/* Logo Header */}
          <View className="items-center mb-8 mt-12">
            <View className="flex-row items-center mb-6">
              <Feather name="zap" size={24} color="#FF4C29" />
              <Text className="text-white text-[22px] font-extrabold ml-2 tracking-wider">
                KIMBIA
              </Text>
            </View>
            <Text className="text-white text-2xl font-bold text-center mb-2">
              Welcome back
            </Text>
            <Text className="text-placeholder text-[15px] text-center px-4 leading-6">
              Please enter your details to access your account.
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-4 flex-col gap-4 mb-6">
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
              label="Password" 
              iconName="lock" 
              placeholder="••••••••" 
              isPassword 
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />
          </View>

          {/* Extra Options */}
          <View className="flex-row justify-between items-center mb-8">
            <TouchableOpacity 
              className="flex-row items-center gap-2"
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View className={`w-4 h-4 rounded items-center justify-center ${rememberMe ? 'bg-primary' : 'bg-surface border border-gray-600'}`}>
                {rememberMe && <Feather name="check" size={12} color="#fff" />}
              </View>
              <Text className="text-placeholder font-medium text-sm">Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text className="text-primary font-semibold text-sm">Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View className="flex-col gap-6 mb-8">
            <TouchableOpacity 
              className="w-full h-12 bg-primary rounded-xl items-center justify-center shadow-lg shadow-primary/25"
              onPress={handleLogin}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">Sign in</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center w-full my-2">
              <View className="flex-1 h-[1px] bg-gray-800" />
              <Text className="text-placeholder px-4 text-[13px] font-medium">or sign in with</Text>
              <View className="flex-1 h-[1px] bg-gray-800" />
            </View>

            <TouchableOpacity className="w-full h-12 bg-surface rounded-xl border border-gray-700 flex-row items-center justify-center gap-2">
              <Feather name="globe" size={18} color="#fff" />
              <Text className="text-white font-semibold text-sm">Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center items-center pb-8 gap-1">
            <Text className="text-placeholder text-sm">Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text className="text-primary font-semibold text-sm">Sign up</Text>
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
