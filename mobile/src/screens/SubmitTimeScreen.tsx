import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../services/apiClient';
import CustomAlert from '../components/CustomAlert';
import { useQueryClient } from '@tanstack/react-query';

const PROOF_PRESETS = [
  {
    id: 'garmin',
    title: 'Garmin Forerunner',
    subtitle: 'Sports Watch Display',
    url: 'https://images.unsplash.com/photo-1510519138197-04b82402b92a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'strava',
    title: 'Strava GPS Activity',
    subtitle: 'App Screenshot',
    url: 'https://images.unsplash.com/photo-1508215885820-4523e431397e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'apple',
    title: 'Apple Watch Workout',
    subtitle: 'Outdoor Run Record',
    url: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=800&q=80',
  },
];

export default function SubmitTimeScreen({ navigation, route }: any) {
  const queryClient = useQueryClient();
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('38');
  const [seconds, setSeconds] = useState('12');

  const [selectedProofUrl, setSelectedProofUrl] = useState(PROOF_PRESETS[0].url);
  const [customProofFileName, setCustomProofFileName] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [registrationId, setRegistrationId] = useState<number | null>(route?.params?.registrationId || null);
  const [raceName, setRaceName] = useState<string>(route?.params?.raceName || 'Rift Valley 10K Challenge');
  const [distance, setDistance] = useState<string>(route?.params?.distance || '10.00 KM');

  const [isLoadingReg, setIsLoadingReg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    if (!registrationId) {
      const fetchActiveRegistration = async () => {
        setIsLoadingReg(true);
        try {
          let res;
          try {
            res = await apiClient.get('/api/users/me/registrations');
          } catch {
            res = await apiClient.get('/api/registrations/my-events');
          }
          if (Array.isArray(res.data) && res.data.length > 0) {
            const paid = res.data.find((r: any) => r.paymentStatus === 'COMPLETED') || res.data[0];
            setRegistrationId(paid.id);
            if (paid.race?.name) setRaceName(paid.race.name);
            if (paid.race?.distance) setDistance(paid.race.distance);
          }
        } catch (e) {
          console.warn('Could not auto-fetch registrations:', e);
        } finally {
          setIsLoadingReg(false);
        }
      };
      fetchActiveRegistration();
    }
  }, [registrationId]);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setAlertConfig({
          visible: true,
          title: 'Permission Required',
          message: 'Permission to access your photos is required to upload proof.',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setIsUploadingPhoto(true);

      const filename = asset.fileName || asset.uri.split('/').pop() || 'proof.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : (asset.mimeType || 'image/jpeg');

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: filename,
        type: type,
      } as any);

      const res = await apiClient.post('/api/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.file_url) {
        setSelectedProofUrl(res.data.file_url);
        setCustomProofFileName(filename);
      }
    } catch (err: any) {
      console.error('Upload proof error:', err);
      const errMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to upload photo proof.';
      setAlertConfig({
        visible: true,
        title: 'Upload Failed',
        message: errMsg,
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const formatTimeString = () => {
    const h = (hours.trim() || '0').padStart(2, '0');
    const m = (minutes.trim() || '0').padStart(2, '0');
    const s = (seconds.trim() || '0').padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleSubmit = async () => {
    const formattedTime = formatTimeString();
    if (formattedTime === '00:00:00') {
      setAlertConfig({
        visible: true,
        title: 'Invalid Finishing Time',
        message: 'Please enter a valid non-zero finishing time.',
      });
      return;
    }

    if (!registrationId) {
      setAlertConfig({
        visible: true,
        title: 'Registration Required',
        message: 'No completed race registration found. Please register and complete payment for a race first.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/api/results', {
        registration_id: registrationId,
        finishing_time: formattedTime,
        proof_image_url: selectedProofUrl,
        is_dnf: false,
      });

      await queryClient.invalidateQueries({ queryKey: ['my-registrations'] });

      navigation.navigate('SubmissionSuccess', {
        submittedTime: formattedTime,
        raceName: raceName,
      });
    } catch (err: any) {
      console.error('Submit result error:', err);
      const errMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit result. Please try again.';
      setAlertConfig({
        visible: true,
        title: 'Submission Failed',
        message: errMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-surface rounded-full items-center justify-center"
        >
          <Feather name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold text-center">SUBMIT TIME</Text>
        <View className="w-10 h-10" />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 110 }}>
          {/* Event Widget */}
          <View className="bg-surface p-4 rounded-2xl flex-row gap-3 items-center mb-5 mt-2 border border-[#243249]">
            <View className="w-[60px] h-[60px] bg-primary/20 rounded-xl items-center justify-center border border-primary/30">
              <Feather name="award" size={28} color="#FF4C29" />
            </View>
            <View className="flex-col gap-1 flex-1">
              <Text className="text-white font-bold text-base" numberOfLines={1}>
                {raceName}
              </Text>
              <Text className="text-[#CCFF00] font-bold text-xs">
                Verified Distance: {distance}
              </Text>
              {registrationId && (
                <Text className="text-placeholder text-[11px]">Registration #{registrationId}</Text>
              )}
            </View>
          </View>

          {/* Time to Submission Deadline */}
          <View className="flex-col gap-2 mb-5">
            <Text className="text-placeholder font-semibold text-[13px] uppercase">
              time to submission deadline
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-col items-center bg-[#1E2A3E] border border-[#243249] rounded-xl p-3 flex-1">
                <Text className="text-white font-extrabold text-2xl">00</Text>
                <Text className="text-placeholder text-[10px] uppercase">HRS</Text>
              </View>
              <View className="flex-col items-center bg-[#1E2A3E] border border-[#243249] rounded-xl p-3 flex-1">
                <Text className="text-white font-extrabold text-2xl">41</Text>
                <Text className="text-placeholder text-[10px] uppercase">MINS</Text>
              </View>
              <View className="flex-col items-center bg-[#1E2A3E] border border-[#243249] rounded-xl p-3 flex-1">
                <Text className="text-white font-extrabold text-2xl">24</Text>
                <Text className="text-placeholder text-[10px] uppercase">SECS</Text>
              </View>
            </View>
          </View>

          {/* Your Race Time Input */}
          <View className="flex-col gap-2 mb-5">
            <View className="flex-row justify-between items-center">
              <Text className="text-placeholder font-semibold text-[13px] uppercase">your race time</Text>
              <Text className="text-[#CCFF00] font-mono font-bold text-sm">
                {formatTimeString()}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-col items-center bg-[#1E2A3E] border border-[#243249] rounded-xl p-3 w-[100px]">
                <TextInput
                  className="text-white font-extrabold text-2xl text-center w-full"
                  placeholder="00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={2}
                  value={hours}
                  onChangeText={(val) => setHours(val.replace(/[^0-9]/g, ''))}
                />
                <Text className="text-placeholder text-[10px] uppercase">HRS</Text>
              </View>
              <Text className="text-placeholder font-extrabold text-2xl">:</Text>
              <View className="flex-col items-center bg-[#1E2A3E] border border-[#243249] rounded-xl p-3 w-[100px]">
                <TextInput
                  className="text-white font-extrabold text-2xl text-center w-full"
                  placeholder="00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={2}
                  value={minutes}
                  onChangeText={(val) => setMinutes(val.replace(/[^0-9]/g, ''))}
                />
                <Text className="text-placeholder text-[10px] uppercase">MINS</Text>
              </View>
              <Text className="text-placeholder font-extrabold text-2xl">:</Text>
              <View className="flex-col items-center bg-[#1E2A3E] border border-[#243249] rounded-xl p-3 w-[100px]">
                <TextInput
                  className="text-white font-extrabold text-2xl text-center w-full"
                  placeholder="00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={2}
                  value={seconds}
                  onChangeText={(val) => setSeconds(val.replace(/[^0-9]/g, ''))}
                />
                <Text className="text-placeholder text-[10px] uppercase">SECS</Text>
              </View>
            </View>
          </View>

          {/* Photo Upload & Presets */}
          <View className="bg-surface border border-[#243249] rounded-2xl p-5 flex-col gap-3 mb-5">
            <View className="flex-row items-center gap-2">
              <Feather name="camera" size={20} color="#FF4C29" />
              <Text className="text-white font-bold text-[15px]">Sports Watch / Photo Proof</Text>
            </View>
            <Text className="text-placeholder text-xs">
              Upload your sports watch or running app screenshot, or select a preset for quick testing.
            </Text>

            {/* Custom Upload Button */}
            <TouchableOpacity
              onPress={handlePickImage}
              disabled={isUploadingPhoto}
              className={`flex-row items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed ${
                customProofFileName
                  ? 'bg-primary/15 border-primary'
                  : 'bg-[#1E2A3E] border-primary/50'
              }`}
            >
              {isUploadingPhoto ? (
                <>
                  <ActivityIndicator color="#FF4C29" size="small" />
                  <Text className="text-primary font-bold text-xs">Uploading Proof Screenshot...</Text>
                </>
              ) : customProofFileName ? (
                <>
                  <Feather name="check-circle" size={16} color="#CCFF00" />
                  <Text className="text-[#CCFF00] font-bold text-xs" numberOfLines={1}>
                    Uploaded: {customProofFileName}
                  </Text>
                  <Text className="text-placeholder text-[10px] underline ml-1">Change</Text>
                </>
              ) : (
                <>
                  <Feather name="upload" size={16} color="#FF4C29" />
                  <Text className="text-primary font-bold text-xs">Upload Screenshot from Device</Text>
                </>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center gap-2 my-1">
              <View className="flex-1 h-[1px] bg-[#243249]" />
              <Text className="text-placeholder text-[10px] uppercase font-semibold">Or Choose A Preset</Text>
              <View className="flex-1 h-[1px] bg-[#243249]" />
            </View>

            {/* Presets Row */}
            <View className="flex-col gap-2">
              {PROOF_PRESETS.map((preset) => {
                const isSelected = selectedProofUrl === preset.url && !customProofFileName;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    onPress={() => {
                      setSelectedProofUrl(preset.url);
                      setCustomProofFileName(null);
                    }}
                    className={`flex-row items-center justify-between p-2.5 rounded-xl border ${
                      isSelected
                        ? 'bg-primary/15 border-primary'
                        : 'bg-[#1E2A3E] border-[#243249]'
                    }`}
                  >
                    <View className="flex-row items-center gap-3">
                      <Image
                        source={{ uri: preset.url }}
                        className="w-10 h-10 rounded-lg bg-gray-800"
                      />
                      <View>
                        <Text className="text-white font-bold text-xs">{preset.title}</Text>
                        <Text className="text-placeholder text-[10px]">{preset.subtitle}</Text>
                      </View>
                    </View>
                    {isSelected ? (
                      <Feather name="check-circle" size={18} color="#FF4C29" />
                    ) : (
                      <Feather name="circle" size={18} color="#6B7280" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected Image Preview */}
            {selectedProofUrl && (
              <View className="mt-2 rounded-xl overflow-hidden border border-[#243249] relative">
                <Image
                  source={{ uri: selectedProofUrl }}
                  className="w-full h-32"
                  resizeMode="cover"
                />
                <View className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded-md flex-row items-center gap-1">
                  <Feather name="check" size={12} color="#CCFF00" />
                  <Text className="text-[#CCFF00] font-bold text-[10px]">
                    {customProofFileName ? 'Custom Proof Attached' : 'Preset Proof Attached'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`w-full bg-primary py-4 rounded-xl flex-row justify-center items-center gap-2 mb-5 shadow-lg shadow-primary/25 ${
              isSubmitting || isLoadingReg ? 'opacity-70' : ''
            }`}
            onPress={handleSubmit}
            disabled={isSubmitting || isLoadingReg}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name="check-circle" size={20} color="#fff" />
                <Text className="text-white font-bold text-base uppercase">SUBMIT VERIFIED RUN</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />

      {/* Bottom Nav Placeholder */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-[#243249]">
        <View className="flex-row items-center justify-between px-4 pt-3 pb-6">
          <TouchableOpacity
            className="items-center gap-1 w-[72px]"
            onPress={() => navigation.navigate('Explore')}
          >
            <Feather name="compass" size={22} color="#9CA3AF" />
            <Text className="text-[#9CA3AF] font-semibold text-[11px]">Explore</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center gap-1 w-[72px]"
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Feather name="award" size={22} color="#9CA3AF" />
            <Text className="text-[#9CA3AF] font-semibold text-[11px]">Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center gap-1 w-[72px]"
            onPress={() => navigation.navigate('MyEvents')}
          >
            <Feather name="calendar" size={22} color="#9CA3AF" />
            <Text className="text-[#9CA3AF] font-semibold text-[11px]">My Events</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center gap-1 w-[72px]"
            onPress={() => navigation.navigate('Profile')}
          >
            <Feather name="user" size={22} color="#9CA3AF" />
            <Text className="text-[#9CA3AF] font-semibold text-[11px]">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
