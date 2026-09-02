import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'info';
  onClose: () => void;
}

export default function CustomAlert({ visible, title, message, type = 'error', onClose }: CustomAlertProps) {
  const isError = type === 'error';
  const iconName = isError ? 'alert-circle' : type === 'success' ? 'check-circle' : 'info';
  const color = isError ? '#FF4C29' : type === 'success' ? '#CCFF00' : '#3B82F6';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-surface w-full rounded-3xl border border-gray-700 p-6 items-center flex-col gap-4">
          <View className={`w-16 h-16 rounded-full items-center justify-center bg-background border border-[${color}]/30`}>
            <Feather name={iconName} size={32} color={color} />
          </View>
          <Text className="text-white text-xl font-bold text-center">{title}</Text>
          <Text className="text-placeholder text-center text-[15px] leading-6 px-2">
            {message}
          </Text>
          <TouchableOpacity 
            onPress={onClose}
            className="w-full bg-primary py-4 rounded-xl items-center mt-4 shadow-lg shadow-primary/25"
          >
            <Text className="text-white font-bold text-base uppercase">Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
