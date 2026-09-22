import React, { useMemo, useState } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

interface RegistrationItem {
  id: number;
  paymentStatus: string;
  bibNumber?: string;
  bibImgUrl?: string;
  status?: string;
  has_submitted_time?: boolean;
  hasSubmittedTime?: boolean;
  finishing_time?: string;
  result_moderation_status?: string;
  resultModerationStatus?: string;
  registeredAt?: string;
  race?: {
    id: number;
    name: string;
    distance: string;
    raceDate: string;
    fee: number;
    status: string;
    bibTemplateUrl?: string;
    submissionDeadline?: string;
    description?: string;
  };
}

export default function ProfileScreen({ navigation }: any) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Fetch current runner profile
  const { 
    data: user, 
    isLoading: isLoadingProfile, 
    refetch: refetchProfile 
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await apiClient.get('/api/users/me');
      return response.data;
    },
  });

  // 2. Fetch runner's race registrations
  const { 
    data: registrations = [], 
    isLoading: isLoadingRegistrations, 
    refetch: refetchRegistrations 
  } = useQuery<RegistrationItem[]>({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/users/me/registrations');
        return response.data;
      } catch {
        const response = await apiClient.get('/api/registrations/my-events');
        return response.data;
      }
    },
  });

  // Coordinated pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchProfile(), refetchRegistrations()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper: parse string distances (e.g. "5K", "10 KM", "21.1 KM", "42.195 KM") into number km
  const parseDistanceKm = (distanceStr?: string): number => {
    if (!distanceStr) return 0;
    const lower = distanceStr.toLowerCase();
    if (lower.includes('half') || lower.includes('21.1')) return 21.1;
    if (lower.includes('marathon') && !lower.includes('half')) {
      const match = distanceStr.match(/([0-9.]+)/);
      return match ? parseFloat(match[1]) : 42.195;
    }
    const match = distanceStr.match(/([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Helper: convert HH:MM:SS or MM:SS to total seconds
  const parseTimeToSeconds = (timeStr?: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map((p) => parseInt(p, 10) || 0);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  // Helper: format seconds per km into "M:SS /km"
  const formatPace = (secsPerKm: number): string => {
    if (!secsPerKm || secsPerKm <= 0 || !isFinite(secsPerKm)) return '--:-- /km';
    const mins = Math.floor(secsPerKm / 60);
    const secs = Math.round(secsPerKm % 60);
    return `${mins}:${secs.toString().padStart(2, '0')} /km`;
  };

  // Helper: format date cleanly
  const formatDisplayDate = (dateStr?: string): string => {
    if (!dateStr) return 'TBA';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Helper: member since formatter
  const formatMemberSince = (dateStr?: string): string => {
    if (!dateStr) return 'Kimbia Runner since 2026';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Kimbia Runner since 2026';
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const year = d.getFullYear();
      return `Kimbia Runner since ${month} ${year}`;
    } catch {
      return 'Kimbia Runner since 2026';
    }
  };

  // Helper: format age group
  const formatAgeGroup = (group?: string): string => {
    if (!group) return '';
    switch (group) {
      case 'UNDER_18': return '<18';
      case 'AGE_18_35': return '18-35';
      case 'AGE_36_50': return '36-50';
      case 'AGE_51_65': return '51-65';
      case 'OVER_65': return '65+';
      default: return group.replace('AGE_', '').replace('_', '-');
    }
  };

  // 3. Dynamic Stats Aggregations
  const stats = useMemo(() => {
    if (!Array.isArray(registrations)) {
      return { completedCount: 0, totalDistanceKm: '0.0', avgPace: '--:-- /km' };
    }

    const completed = registrations.filter((r) => {
      const isPaid = r.paymentStatus === 'COMPLETED';
      const hasSubmitted = Boolean(r.has_submitted_time || r.finishing_time || r.hasSubmittedTime);
      const isApproved = 
        r.result_moderation_status === 'APPROVED' || 
        r.resultModerationStatus === 'APPROVED';
      return isPaid && hasSubmitted && isApproved;
    });

    let totalKm = 0;
    let totalSeconds = 0;
    let racesWithPace = 0;

    completed.forEach((reg) => {
      const km = parseDistanceKm(reg.race?.distance);
      const timeStr = reg.finishing_time;
      const secs = parseTimeToSeconds(timeStr);

      totalKm += km;
      if (km > 0 && secs > 0) {
        totalSeconds += secs;
        racesWithPace += 1;
      }
    });

    const avgSecsPerKm = totalKm > 0 && totalSeconds > 0 ? totalSeconds / totalKm : 0;

    return {
      completedCount: completed.length,
      totalDistanceKm: totalKm.toFixed(1),
      avgPace: formatPace(avgSecsPerKm),
    };
  }, [registrations]);

  // 4. Dynamic Digital Bibs
  const digitalBibs = useMemo(() => {
    if (!Array.isArray(registrations)) return [];
    return registrations.filter(
      (r) => r.paymentStatus === 'COMPLETED' && Boolean(r.bibNumber)
    );
  }, [registrations]);

  // 5. Dynamic Next Up Race
  const nextUpRace = useMemo(() => {
    if (!Array.isArray(registrations)) return null;
    const upcoming = registrations.filter((r) => {
      const isPaid = r.paymentStatus === 'COMPLETED';
      const hasSubmitted = Boolean(r.has_submitted_time || r.finishing_time || r.hasSubmittedTime);
      return isPaid && !hasSubmitted && Boolean(r.race);
    });

    if (upcoming.length === 0) return null;

    // Pick race with earliest race date
    return upcoming.sort((a, b) => {
      const dateA = a.race?.raceDate ? new Date(a.race.raceDate).getTime() : 0;
      const dateB = b.race?.raceDate ? new Date(b.race.raceDate).getTime() : 0;
      return dateA - dateB;
    })[0];
  }, [registrations]);

  // 6. Dynamic Recent Achievements (Submitted races with moderation status)
  const recentAchievements = useMemo(() => {
    if (!Array.isArray(registrations)) return [];
    const submitted = registrations.filter((r) => {
      return Boolean(r.has_submitted_time || r.finishing_time || r.hasSubmittedTime);
    });

    // Sort descending by raceDate or registration id
    return submitted.sort((a, b) => {
      const dateA = a.race?.raceDate ? new Date(a.race.raceDate).getTime() : 0;
      const dateB = b.race?.raceDate ? new Date(b.race.raceDate).getTime() : 0;
      return dateB - dateA;
    });
  }, [registrations]);

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.name || 'Runner'
  )}&background=FF4C29&color=fff&bold=true&size=200`;

  const userAvatar = user?.avatarUrl || user?.avatar_url || fallbackAvatar;

  const ageGroupBadge = formatAgeGroup(user?.ageGroup);
  const genderBadge = user?.gender && user.gender !== 'PREFER_NOT_TO_SAY' ? user.gender : null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="w-10 h-10" />
        <Text className="text-white text-lg font-bold text-center tracking-wide">
          RUNNER PROFILE
        </Text>
        <TouchableOpacity
          className="w-10 h-10 bg-surface rounded-full items-center justify-center border border-[#243249]"
          onPress={() => navigation.navigate('Settings')}
        >
          <Feather name="settings" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#FF4C29"
            colors={['#FF4C29']}
          />
        }
      >
        {isLoadingProfile && isLoadingRegistrations ? (
          <View className="py-24 items-center justify-center">
            <ActivityIndicator size="large" color="#FF4C29" />
            <Text className="text-placeholder text-xs mt-3">Loading runner profile...</Text>
          </View>
        ) : (
          <>
            {/* Bio Header */}
            <View className="flex-row items-center gap-4 mb-6 mt-2">
              <Image
                source={{ uri: userAvatar }}
                className="w-20 h-20 rounded-full border-2 border-primary"
              />
              <View className="flex-col gap-1 flex-1">
                {isLoadingProfile ? (
                  <ActivityIndicator color="#FF4C29" className="self-start" />
                ) : (
                  <Text className="text-white font-extrabold text-[22px]" numberOfLines={1}>
                    {user?.name || 'Kimbia Runner'}
                  </Text>
                )}
                <Text className="text-placeholder text-[13px]">
                  {formatMemberSince(user?.createdAt)}
                </Text>

                {/* Profile badges */}
                {(ageGroupBadge || genderBadge) && (
                  <View className="flex-row items-center gap-2 mt-1">
                    {genderBadge && (
                      <View className="bg-surface px-2 py-0.5 rounded-md border border-[#243249]">
                        <Text className="text-[#9CA3AF] text-[11px] font-bold uppercase">
                          {genderBadge}
                        </Text>
                      </View>
                    )}
                    {ageGroupBadge && (
                      <View className="bg-surface px-2 py-0.5 rounded-md border border-[#243249]">
                        <Text className="text-[#9CA3AF] text-[11px] font-bold uppercase">
                          {ageGroupBadge}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 bg-surface p-3.5 rounded-2xl flex-col gap-1 border border-[#243249]">
                <Text className="text-placeholder text-[11px] uppercase font-semibold">Completed</Text>
                <Text className="text-white font-extrabold text-base">
                  {stats.completedCount} {stats.completedCount === 1 ? 'Race' : 'Races'}
                </Text>
              </View>
              <View className="flex-1 bg-surface p-3.5 rounded-2xl flex-col gap-1 border border-[#243249]">
                <Text className="text-placeholder text-[11px] uppercase font-semibold">Total Distance</Text>
                <Text className="text-primary font-extrabold text-base">
                  {stats.totalDistanceKm} KM
                </Text>
              </View>
              <View className="flex-1 bg-surface p-3.5 rounded-2xl flex-col gap-1 border border-[#243249]">
                <Text className="text-placeholder text-[11px] uppercase font-semibold">Avg Pace</Text>
                <Text className="text-[#CCFF00] font-extrabold text-base">
                  {stats.avgPace}
                </Text>
              </View>
            </View>

            {/* Bib Gallery */}
            <View className="flex-col gap-3 mb-6">
              <View className="flex-row justify-between items-center">
                <Text className="text-white font-bold text-base uppercase">
                  My Digital Bibs ({digitalBibs.length})
                </Text>
                {digitalBibs.length > 0 && (
                  <TouchableOpacity onPress={() => navigation.navigate('MyEvents')}>
                    <Text className="text-primary text-xs font-bold">View All</Text>
                  </TouchableOpacity>
                )}
              </View>

              {digitalBibs.length === 0 ? (
                <View className="bg-surface rounded-2xl p-5 border border-[#243249] items-center">
                  <Feather name="credit-card" size={28} color="#9CA3AF" />
                  <Text className="text-white font-bold text-sm mt-2">No Digital Bibs Yet</Text>
                  <Text className="text-placeholder text-xs text-center mt-1 px-4 mb-3">
                    Register and complete payment for an upcoming race to receive your official bib number.
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Explore')}
                    className="bg-primary px-4 py-2 rounded-xl"
                  >
                    <Text className="text-white font-bold text-xs">Browse Races</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                  {digitalBibs.map((reg, index) => {
                    const isEven = index % 2 === 0;
                    const accentColor = isEven ? '#FF4C29' : '#CCFF00';
                    const borderColor = isEven ? 'border-primary' : 'border-[#CCFF00]';
                    const bgUrl =
                      reg.race?.bibTemplateUrl ||
                      (isEven
                        ? 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=400&q=80'
                        : 'https://images.unsplash.com/photo-1505051508008-923feaf90180?auto=format&fit=crop&w=400&q=80');

                    return (
                      <TouchableOpacity
                        key={reg.id}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('DigitalBib', { registrationId: reg.id })}
                        className={`w-[210px] h-[126px] rounded-2xl overflow-hidden mr-3.5 border-2 ${borderColor} shadow-lg shadow-black/40`}
                      >
                        <Image
                          source={{ uri: bgUrl }}
                          className="absolute inset-0 w-full h-full opacity-35"
                          resizeMode="cover"
                        />
                        <View className="absolute inset-0 p-3.5 flex-col justify-between">
                          <View className="flex-row justify-between items-center w-full">
                            <Text
                              className="font-black text-xs tracking-wider"
                              style={{ color: accentColor }}
                            >
                              KIMBIA
                            </Text>
                            <View className="bg-black/50 px-2 py-0.5 rounded-full">
                              <Text className="text-white text-[10px] font-bold">
                                {reg.race?.distance || 'VIRTUAL'}
                              </Text>
                            </View>
                          </View>

                          <Text className="text-white font-black text-[30px] text-center tracking-widest">
                            {reg.bibNumber}
                          </Text>

                          <Text
                            className="text-placeholder font-semibold text-[11px]"
                            numberOfLines={1}
                          >
                            {reg.race?.name || 'Kimbia Virtual Race'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Upcoming Race ("Next Up") */}
            <View className="flex-col gap-3 mb-6">
              <Text className="text-white font-bold text-base uppercase">Next Up</Text>
              {nextUpRace ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  className="bg-surface p-4 rounded-2xl flex-row items-center gap-3.5 border border-[#243249]"
                  onPress={() =>
                    navigation.navigate('EventDetails', {
                      raceId: nextUpRace.race?.id,
                      race: nextUpRace.race,
                    })
                  }
                >
                  <Image
                    source={{
                      uri:
                        nextUpRace.race?.bibTemplateUrl ||
                        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=300&q=80',
                    }}
                    className="w-[58px] h-[58px] rounded-xl"
                    resizeMode="cover"
                  />
                  <View className="flex-col gap-1 flex-1">
                    <Text className="text-white font-bold text-[15px]" numberOfLines={1}>
                      {nextUpRace.race?.name}
                    </Text>
                    <Text className="text-primary font-semibold text-xs">
                      {formatDisplayDate(nextUpRace.race?.raceDate)} • Distance: {nextUpRace.race?.distance}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ) : (
                <View className="bg-surface p-5 rounded-2xl border border-[#243249] items-center">
                  <Feather name="calendar" size={24} color="#9CA3AF" />
                  <Text className="text-white font-bold text-sm mt-2">No Upcoming Races Scheduled</Text>
                  <Text className="text-placeholder text-xs text-center mt-1 px-4 mb-3">
                    Find your next running challenge and register to get active.
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Explore')}
                    className="bg-primary px-4 py-2 rounded-xl"
                  >
                    <Text className="text-white font-bold text-xs">Find a Race</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Recent Achievements */}
            <View className="flex-col gap-3 mb-6">
              <Text className="text-white font-bold text-base uppercase">Recent Achievements</Text>
              {recentAchievements.length === 0 ? (
                <View className="bg-surface p-5 rounded-2xl border border-[#243249] items-center">
                  <Feather name="award" size={26} color="#9CA3AF" />
                  <Text className="text-white font-bold text-sm mt-2">No Race Results Yet</Text>
                  <Text className="text-placeholder text-xs text-center mt-1 px-4">
                    Complete your registered races and submit your finishing times to earn verified achievements here.
                  </Text>
                </View>
              ) : (
                recentAchievements.map((reg) => {
                  const moderationStatus =
                    reg.result_moderation_status || reg.resultModerationStatus || 'PENDING';
                  const isApproved = moderationStatus === 'APPROVED';
                  const isRejected = moderationStatus === 'REJECTED';
                  const finishTime = reg.finishing_time || '00:00:00';

                  return (
                    <TouchableOpacity
                      key={reg.id}
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('Leaderboard', { raceId: reg.race?.id })}
                      className="bg-surface p-4 rounded-2xl flex-row justify-between items-center border border-[#243249]"
                    >
                      <View className="flex-col gap-1 flex-1 pr-3">
                        <Text className="text-white font-bold text-[15px]" numberOfLines={1}>
                          {reg.race?.name || 'Virtual Race'}
                        </Text>
                        <Text className="text-placeholder text-xs">
                          {formatDisplayDate(reg.race?.raceDate)} • {reg.race?.distance}
                        </Text>
                      </View>

                      <View className="flex-col gap-1 items-end">
                        <Text className="text-[#CCFF00] font-mono font-bold text-[15px]">
                          {finishTime}
                        </Text>
                        <View
                          className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${
                            isApproved
                              ? 'bg-[#CCFF00]/10'
                              : isRejected
                              ? 'bg-red-500/10'
                              : 'bg-yellow-500/10'
                          }`}
                        >
                          <Feather
                            name={isApproved ? 'check-circle' : isRejected ? 'x-circle' : 'clock'}
                            size={10}
                            color={isApproved ? '#CCFF00' : isRejected ? '#EF4444' : '#EAB308'}
                          />
                          <Text
                            className={`font-bold text-[10px] ${
                              isApproved
                                ? 'text-[#CCFF00]'
                                : isRejected
                                ? 'text-red-400'
                                : 'text-yellow-400'
                            }`}
                          >
                            {isApproved ? 'VERIFIED' : isRejected ? 'REJECTED' : 'UNDER REVIEW'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Nav Bar */}
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
          <TouchableOpacity className="items-center gap-1 w-[72px]">
            <Feather name="user" size={22} color="#FF4C29" />
            <Text className="text-primary font-semibold text-[11px]">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
