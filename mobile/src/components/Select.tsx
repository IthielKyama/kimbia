import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  iconName?: React.ComponentProps<typeof Feather>['name'];
}

export default function Select({ label, options, value, onChange, iconName }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View className="flex-col w-full space-y-2 mb-4">
      <Text className="text-white font-semibold text-sm mb-2">{label}</Text>
      
      <TouchableOpacity 
        className="flex-row items-center bg-surface px-4 py-3 rounded-xl border border-gray-700 justify-between"
        onPress={() => setIsOpen(true)}
      >
        <View className="flex-row items-center">
          {iconName && <Feather name={iconName} size={18} color="#9CA3AF" />}
          <Text className={`ml-3 text-[15px] ${selectedOption ? 'text-white' : 'text-placeholder'}`}>
            {selectedOption ? selectedOption.label : 'Select an option'}
          </Text>
        </View>
        <Feather name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View className="flex-1 bg-black/60 justify-center px-6">
            <TouchableWithoutFeedback>
              <View className="bg-surface rounded-2xl border border-gray-700 overflow-hidden py-2 max-h-[60%]">
                <Text className="text-white font-bold text-lg px-4 py-3 border-b border-gray-800">{label}</Text>
                <ScrollView>
                  {options.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      className="px-4 py-4 flex-row items-center justify-between border-b border-gray-800/50"
                      onPress={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                    >
                      <Text className={`text-[15px] ${value === option.value ? 'text-primary font-bold' : 'text-gray-300'}`}>
                        {option.label}
                      </Text>
                      {value === option.value && <Feather name="check" size={18} color="#FF4C29" />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
