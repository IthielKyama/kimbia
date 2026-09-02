import React, { useState } from 'react';
import { View, TextInput, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label: string;
  iconName: React.ComponentProps<typeof Feather>['name'];
  isPassword?: boolean;
  error?: string;
}

export default function Input({ label, iconName, isPassword, error, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="flex-col w-full space-y-2">
      <Text className="text-white font-semibold text-sm mb-2">{label}</Text>
      <View className={`flex-row items-center bg-surface px-4 py-3 rounded-xl border ${error ? 'border-[#FF4C29]' : 'border-gray-700'}`}>
        <Feather name={iconName} size={18} color={error ? '#FF4C29' : '#9CA3AF'} />
        <TextInput
          className="flex-1 ml-3 text-white text-[15px]"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text className="text-[#FF4C29] text-xs mt-1">{error}</Text> : null}
    </View>
  );
}
