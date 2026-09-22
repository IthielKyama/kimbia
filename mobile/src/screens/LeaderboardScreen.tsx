import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

interface RaceItem {
  id: number;
  name: string;
  distance: string;
  raceDate: string;
}

interface LeaderboardEntry {
  id: number;
  runner_name?: string;
  runner_email?: string;
  user_id?: number;
  bib_number?: string;
  finishing_time: string;
  moderation_status?: string;
  category?: string;
  gender?: string;
}

export default function LeaderboardScreen({ navigation, route }: any) {
  const [selectedRaceId, setSelectedRaceId] = useState<number | null>(route?.params?.raceId ?? null);
  const [activeTab, setActiveTab] = useState<'Overall' | 'Men' | 'Women'>('Overall');
  const [showRaceSelector, setShowRaceSelector] = useState(false);

  // Sync selected race whenever route param changes (e.g. from Profile achievements or My Events)
  useEffect(() => {
    if (route?.params?.raceId) {
      setSelectedRaceId(route.params.raceId);
    }
  }, [route?.params?.raceId]);

  // Fetch published races
  const { data: races = [], isLoading: isLoadingRaces, refetch: refetchRaces } = useQuery<RaceItem[]>({
    queryKey: ['races'],
    queryFn: async () => {
      const res = await apiClient.get<RaceItem[]>('/api/races');
      return res.data;
    },
  });

  // Fetch specific race details if selected race is not in the published list (e.g. past or closed race)
  const { data: specificRace } = useQuery<RaceItem>({
    queryKey: ['raceDetails', selectedRaceId],
    queryFn: async () => {
      const res = await apiClient.get<RaceItem>(`/api/races/${selectedRaceId}`);
      return res.data;
    },
    enabled: !!selectedRaceId && !races.some((r) => r.id === selectedRaceId),
  });

  // Default to selected race, or first race if not yet selected
  const activeRace = useMemo(() => {
    if (selectedRaceId) {
      const found = races.find((r) => r.id === selectedRaceId);
      if (found) return found;
      if (specificRace) return specificRace;
    }
    return races[0];
  }, [races, selectedRaceId, specificRace]);

  const allSelectableRaces = useMemo(() => {
    if (specificRace && !races.some((r) => r.id === specificRace.id)) {
      return [specificRace, ...races];
    }
    return races;
  }, [races, specificRace]);

  const currentRaceId = activeRace?.id;

  // Fetch verified/approved leaderboard results for selected race
  const {
    data: leaderboard = [],
    isLoading: isLoadingResults,
    isRefetching,
    refetch: refetchLeaderboard,
  } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', currentRaceId],
    queryFn: async () => {
      if (!currentRaceId) return [];
      const res = await apiClient.get<LeaderboardEntry[]>(`/api/races/${currentRaceId}/leaderboard`);
      return res.data;
    },
    enabled: !!currentRaceId,
  });

  // Fetch logged in user to highlight "(You)"
  const { data: currentUser } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/users/me');
        return res.data;
      } catch {
        return null;
      }
    },
  });

  const onRefresh = () => {
    refetchRaces();
    if (currentRaceId) refetchLeaderboard();
  };

  // Helper to parse distance to km
  const getDistanceKm = (distanceStr?: string) => {
    if (!distanceStr) return 10;
    const match = distanceStr.match(/([0-9.]+)/);
    return match ? parseFloat(match[1]) : 10;
  };

  // Helper to compute pace from time and distance
  const computePace = (timeStr?: string, distanceStr?: string) => {
    if (!timeStr) return '--:-- /km';
    const parts = timeStr.split(':').map((p) => parseInt(p, 10) || 0);
    let totalSecs = 0;
    if (parts.length === 3) {
      totalSecs = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      totalSecs = parts[0] * 60 + parts[1];
    }
    if (totalSecs <= 0) return '--:-- /km';

    const dist = getDistanceKm(distanceStr);
    const secsPerKm = totalSecs / dist;
    const paceMins = Math.floor(secsPerKm / 60);
    const paceSecs = Math.round(secsPerKm % 60);
    return `${paceMins}:${paceSecs.toString().padStart(2, '0')} /km`;
  };

  // Filter entries by tab
  const filteredLeaderboard = useMemo(() => {
    if (activeTab === 'Overall') return leaderboard;
    if (activeTab === 'Men') {
      return leaderboard.filter(
        (entry) => !entry.gender || entry.gender === 'MALE' || entry.gender === 'M'
      );
    }
    if (activeTab === 'Women') {
      return leaderboard.filter(
        (entry) => entry.gender === 'FEMALE' || entry.gender === 'F'
      );
    }
    return leaderboard;
  }, [leaderboard, activeTab]);

  const isCurrentRunner = (entry: LeaderboardEntry) => {
    if (!currentUser) return false;
    if (entry.user_id && currentUser.id && entry.user_id === currentUser.id) return true;
    if (entry.runner_email && currentUser.email && entry.runner_email.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (entry.runner_name && currentUser.name && entry.runner_name.toLowerCase() === currentUser.name.toLowerCase()) return true;
    return false;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="w-10 h-10" />
        <Text className="text-white text-lg font-bold text-center">LEADERBOARD</Text>
        <TouchableOpacity
          onPress={onRefresh}
          className="w-10 h-10 bg-surface rounded-full items-center justify-center"
        >
          <Feather name="refresh-cw" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-5 pt-2 pb-5 flex-col gap-4">
        {/* Race Select Dropdown */}
        <TouchableOpacity
          onPress={() => setShowRaceSelector(true)}
          className="bg-surface rounded-xl p-3.5 flex-row items-center justify-between border border-[#243249]"
        >
          <View className="flex-row items-center gap-2.5 flex-1 pr-2">
            <Feather name="award" size={20} color="#FF4C29" />
            <Text className="text-white font-bold text-base" numberOfLines={1}>
              {activeRace ? activeRace.name : 'Select Race...'}
            </Text>
          </View>
          <Feather name="chevron-down" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Tabs */}
        <View className="flex-row gap-2 max-h-9 min-h-[36px]">
          {(['Overall', 'Men', 'Women'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg justify-center ${
                  isActive ? 'bg-primary' : 'bg-surface border border-[#243249]'
                }`}
              >
                <Text className={`font-bold text-xs ${isActive ? 'text-white' : 'text-placeholder'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Table Header */}
        <View className="flex-row items-center px-3 py-1 gap-3">
          <Text className="w-[34px] text-placeholder text-xs font-regular">RANK</Text>
          <Text className="flex-1 text-placeholder text-xs font-regular">RUNNER</Text>
          <Text className="w-[80px] text-placeholder text-xs font-regular text-right">TIME</Text>
          <Text className="w-[70px] text-placeholder text-xs font-regular text-right">PACE</Text>
        </View>

        {/* Leaderboard Rows */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              tintColor="#FF4C29"
              colors={['#FF4C29']}
            />
          }
        >
          {isLoadingRaces || isLoadingResults ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#FF4C29" />
              <Text className="text-placeholder text-xs mt-3">Loading verified rankings...</Text>
            </View>
          ) : filteredLeaderboard.length === 0 ? (
            <View className="py-20 items-center justify-center px-4">
              <Feather name="award" size={40} color="#374151" />
              <Text className="text-white font-bold text-base mt-3">No Approved Times Yet</Text>
              <Text className="text-placeholder text-xs text-center mt-1">
                Official times will appear as race admin reviews and approves submissions.
              </Text>
            </View>
          ) : (
            <View className="flex-col gap-2 pb-24">
              {filteredLeaderboard.map((entry, index) => {
                const rank = index + 1;
                const isYou = isCurrentRunner(entry);
                const runnerName = entry.runner_name || 'Anonymous Runner';
                const finishingTime = entry.finishing_time || '00:00:00';
                const pace = computePace(finishingTime, activeRace?.distance);

                return (
                  <View
                    key={entry.id}
                    className={`rounded-xl p-3 flex-row items-center gap-3 ${
                      isYou
                        ? 'bg-[#1E2A3E] border-[1.5px] border-primary shadow-lg shadow-primary/20'
                        : 'bg-surface border border-[#243249]'
                    }`}
                  >
                    {/* Rank */}
                    <View className="w-[30px] items-center justify-center">
                      {rank === 1 ? (
                        <Feather name="award" size={18} color="#EAB308" />
                      ) : rank === 2 ? (
                        <Feather name="award" size={18} color="#9CA3AF" />
                      ) : rank === 3 ? (
                        <Feather name="award" size={18} color="#D97706" />
                      ) : (
                        <Text className="text-white font-bold text-sm">{rank}</Text>
                      )}
                    </View>

                    {/* Runner Name & Verified Badge */}
                    <View className="flex-1 flex-row items-center gap-1.5 pr-1">
                      <Text
                        className={`font-bold text-sm ${isYou ? 'text-white' : 'text-white'}`}
                        numberOfLines={1}
                      >
                        {runnerName} {isYou ? '(You)' : ''}
                      </Text>
                      {/* Verified Checkmark for approved submissions */}
                      <Feather name="check-circle" size={13} color="#CCFF00" />
                    </View>

                    {/* Time */}
                    <Text className="w-[80px] text-[#CCFF00] font-mono font-bold text-sm text-right">
                      {finishingTime}
                    </Text>

                    {/* Pace */}
                    <Text className="w-[70px] text-placeholder text-[12px] text-right">
                      {pace}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Race Selector Modal */}
      <Modal
        visible={showRaceSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRaceSelector(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/70 justify-center px-5"
          activeOpacity={1}
          onPress={() => setShowRaceSelector(false)}
        >
          <View className="bg-surface border border-[#243249] rounded-2xl p-5 max-h-[400px]">
            <Text className="text-white font-bold text-lg mb-3">Select Race Leaderboard</Text>
            <ScrollView>
              {allSelectableRaces.map((race) => (
                <TouchableOpacity
                  key={race.id}
                  className={`p-3 rounded-xl mb-2 flex-row justify-between items-center ${
                    activeRace?.id === race.id
                      ? 'bg-primary/20 border border-primary'
                      : 'bg-[#1E2A3E]'
                  }`}
                  onPress={() => {
                    setSelectedRaceId(race.id);
                    setShowRaceSelector(false);
                  }}
                >
                  <View>
                    <Text className="text-white font-bold text-sm">{race.name}</Text>
                    <Text className="text-placeholder text-xs mt-0.5">{race.distance}</Text>
                  </View>
                  {activeRace?.id === race.id && (
                    <Feather name="check" size={18} color="#FF4C29" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

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
          <TouchableOpacity className="items-center gap-1 w-[72px]">
            <Feather name="award" size={22} color="#FF4C29" />
            <Text className="text-primary font-semibold text-[11px]">Leaderboard</Text>
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

