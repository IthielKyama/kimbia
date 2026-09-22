import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform, Image 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../services/apiClient';
import Select from '../components/Select';
import CustomAlert from '../components/CustomAlert';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const AGE_GROUP_OPTIONS = [
  { value: 'UNDER_18', label: 'Under 18' },
  { value: 'AGE_18_35', label: '18 - 35' },
  { value: 'AGE_36_50', label: '36 - 50' },
  { value: 'AGE_51_65', label: '51 - 65' },
  { value: 'OVER_65', label: 'Over 65' },
];

export default function SettingsScreen({ navigation }: any) {
  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await apiClient.get('/api/users/me');
      return response.data;
    },
  });

  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [gender, setGender] = useState('MALE');
  const [ageGroup, setAgeGroup] = useState('AGE_18_35');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'error' | 'success' | 'info';
  }>({ visible: false, title: '', message: '', type: 'error' });

  // Sync loaded user profile into state
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.mobileNumber || user.phone) setMobileNumber(user.mobileNumber || user.phone);
      if (user.gender) setGender(user.gender);
      if (user.ageGroup) setAgeGroup(user.ageGroup);
      if (user.avatarUrl || user.avatar_url) setAvatarUrl(user.avatarUrl || user.avatar_url);
    }
  }, [user]);

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || 'Runner'
  )}&background=FF4C29&color=fff&bold=true&size=200`;

  const handlePickAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setAlertConfig({
          visible: true,
          title: 'Permission Denied',
          message: 'Permission to access your photos is required to update your profile avatar.',
          type: 'error',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIsUploadingImage(true);

        const formData = new FormData();
        const uri = asset.uri;
        const uriParts = uri.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';

        formData.append('file', {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          name: `avatar_${Date.now()}.${fileType}`,
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        } as any);

        const response = await apiClient.post('/api/uploads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data?.file_url) {
          setAvatarUrl(response.data.file_url);
        }
      }
    } catch (err: any) {
      console.error('Failed to upload avatar:', err);
      setAlertConfig({
        visible: true,
        title: 'Upload Failed',
        message: err.response?.data?.error || err.message || 'Could not upload image.',
        type: 'error',
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setAlertConfig({
        visible: true,
        title: 'Validation Error',
        message: 'Full Name cannot be empty.',
        type: 'error',
      });
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.put('/api/users/me', {
        name: name.trim(),
        mobileNumber: mobileNumber.trim(),
        gender,
        ageGroup,
        avatarUrl,
      });

      await queryClient.invalidateQueries({ queryKey: ['userProfile'] });

      setAlertConfig({
        visible: true,
        title: 'Profile Updated',
        message: 'Your profile details have been successfully saved.',
        type: 'success',
      });
    } catch (err: any) {
      setAlertConfig({
        visible: true,
        title: 'Save Failed',
        message: err.response?.data?.error || err.message || 'Failed to update profile.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        apiClient.post('/api/auth/logout', { refreshToken }).catch(() => {});
      }
    } finally {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />

      {/* Custom Feedback Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => {
          const wasSuccess = alertConfig.type === 'success';
          setAlertConfig((prev) => ({ ...prev, visible: false }));
          if (wasSuccess) {
            navigation.goBack();
          }
        }}
      />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <TouchableOpacity
          className="w-10 h-10 bg-surface rounded-full items-center justify-center border border-[#243249]"
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold text-center uppercase tracking-wide">
          Settings
        </Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {isLoadingUser ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#FF4C29" />
            <Text className="text-placeholder text-sm mt-3">Loading profile data...</Text>
          </View>
        ) : (
          <>
            <Text className="text-white font-bold text-base uppercase mb-5">Edit Profile</Text>

            {/* Avatar Photo Picker */}
            <View className="items-center mb-6">
              <View className="relative">
                <Image
                  source={{ uri: avatarUrl || fallbackAvatar }}
                  className="w-24 h-24 rounded-full border-2 border-primary"
                />
                <TouchableOpacity
                  onPress={handlePickAvatar}
                  disabled={isUploadingImage}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary items-center justify-center border-2 border-background shadow-lg shadow-primary/30"
                >
                  {isUploadingImage ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Feather name="camera" size={14} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handlePickAvatar} disabled={isUploadingImage} className="mt-2">
                <Text className="text-primary font-bold text-xs">
                  {isUploadingImage ? 'Uploading photo...' : 'Change Profile Photo'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Edit Form */}
            <View className="flex-col gap-4 mb-8">
              {/* Full Name */}
              <View className="flex-col gap-1.5">
                <Text className="text-placeholder text-[13px] font-semibold uppercase">
                  Full Name
                </Text>
                <View className="bg-surface border border-[#243249] rounded-xl px-4 py-3.5">
                  <TextInput
                    className="text-white text-[15px]"
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Eliud Kipchoge"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Email Address (Read-only credential) */}
              <View className="flex-col gap-1.5">
                <View className="flex-row justify-between items-center">
                  <Text className="text-placeholder text-[13px] font-semibold uppercase">
                    Email Address
                  </Text>
                  <Text className="text-[#9CA3AF] text-[11px]">(Account ID)</Text>
                </View>
                <View className="bg-[#151D2A] border border-[#243249] rounded-xl px-4 py-3.5 opacity-80">
                  <TextInput
                    className="text-gray-400 text-[15px]"
                    value={user?.email || ''}
                    editable={false}
                    placeholderTextColor="#6B7280"
                  />
                </View>
              </View>

              {/* Mobile Phone */}
              <View className="flex-col gap-1.5">
                <Text className="text-placeholder text-[13px] font-semibold uppercase">
                  Mobile Number
                </Text>
                <View className="bg-surface border border-[#243249] rounded-xl px-4 py-3.5">
                  <TextInput
                    className="text-white text-[15px]"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    placeholder="+254 700 000000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Gender Selector */}
              <Select
                label="Gender"
                options={GENDER_OPTIONS}
                value={gender}
                onChange={setGender}
                iconName="user"
              />

              {/* Age Group Selector */}
              <Select
                label="Age Group"
                options={AGE_GROUP_OPTIONS}
                value={ageGroup}
                onChange={setAgeGroup}
                iconName="calendar"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              className="w-full bg-primary py-4 rounded-xl items-center justify-center mb-5 shadow-lg shadow-primary/20 flex-row gap-2"
              onPress={handleSaveProfile}
              disabled={isSaving || isUploadingImage}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name="check" size={18} color="#fff" />
                  <Text className="text-white font-bold text-base uppercase">Save Changes</Text>
                </>
              )}
            </TouchableOpacity>

            <View className="w-full h-[1px] bg-[#243249] mb-5" />

            {/* Logout Button */}
            <TouchableOpacity
              className="w-full border-2 border-primary py-4 rounded-xl flex-row justify-center items-center gap-2 mb-8"
              onPress={handleLogout}
            >
              <Feather name="log-out" size={20} color="#FF4C29" />
              <Text className="text-primary font-bold text-base uppercase">Log Out</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
