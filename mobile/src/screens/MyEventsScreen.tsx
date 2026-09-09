import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

type MyEventsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyEvents'>;

export default function MyEventsScreen({ navigation }: { navigation: MyEventsScreenNavigationProp }) {
  const [filterTab, setFilterTab] = useState<'All' | 'Paid' | 'Pending'>('All');

  const { data: registrations, isLoading, error, refetch, isRefetching } = useQuery({
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

  const counts = useMemo(() => {
    if (!Array.isArray(registrations)) return { all: 0, paid: 0, pending: 0 };
    const paid = registrations.filter((r: any) => r.paymentStatus === 'COMPLETED').length;
    return {
      all: registrations.length,
      paid,
      pending: registrations.length - paid,
    };
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
    if (!Array.isArray(registrations)) return [];
    if (filterTab === 'Paid') {
      return registrations.filter((r: any) => r.paymentStatus === 'COMPLETED');
    }
    if (filterTab === 'Pending') {
      return registrations.filter((r: any) => r.paymentStatus !== 'COMPLETED');
    }
    return registrations;
  }, [registrations, filterTab]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center justify-center px-5 py-3">
        <Text className="text-white text-lg font-bold text-center">MY EVENTS</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5 pt-4" 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch}
            tintColor="#FF4C29" 
            colors={['#FF4C29']}
          />
        }
      >
        {isLoading ? (
          <ActivityIndicator color="#FF4C29" className="mt-10" />
        ) : error ? (
          <View className="mt-10 items-center">
            <Feather name="alert-circle" size={32} color="#FF4C29" />
            <Text className="text-[#FF4C29] mt-3 font-bold text-center px-4">
              Error fetching events: {(error as any).response?.data?.message || error.message}
            </Text>
          </View>
        ) : registrations?.length === 0 ? (
          <View className="mt-20 items-center">
            <View className="w-16 h-16 rounded-full bg-surface items-center justify-center mb-4">
              <Feather name="calendar" size={24} color="#9CA3AF" />
            </View>
            <Text className="text-white text-lg font-bold mb-2">No Registered Events</Text>
            <Text className="text-placeholder text-center px-4">
              You haven't registered for any upcoming races yet.
            </Text>
            <TouchableOpacity 
              className="mt-6 bg-primary px-6 py-3 rounded-full"
              onPress={() => navigation.navigate('Explore')}
            >
              <Text className="text-white font-bold">Explore Races</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Status Filter Tabs */}
            <View className="flex-row gap-2 mb-4">
              {(['All', 'Paid', 'Pending'] as const).map((tab) => {
                const isActive = filterTab === tab;
                const count = tab === 'All' ? counts.all : tab === 'Paid' ? counts.paid : counts.pending;
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setFilterTab(tab)}
                    className={`px-4 py-2 rounded-xl flex-row items-center gap-1.5 ${
                      isActive ? 'bg-primary' : 'bg-surface border border-[#243249]'
                    }`}
                  >
                    <Text className={`font-bold text-xs ${isActive ? 'text-white' : 'text-[#9CA3AF]'}`}>
                      {tab}
                    </Text>
                    {count > 0 && (
                      <View
                        className={`px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-black/25' : 'bg-[#1E2A3E]'
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-bold ${
                            isActive ? 'text-white' : 'text-[#9CA3AF]'
                          }`}
                        >
                          {count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Section Header */}
            <View className="flex-row items-center justify-between mb-4 mt-1">
              <Text className="text-placeholder font-semibold text-xs uppercase tracking-wider">
                YOUR REGISTERED RACES
              </Text>
              <Text className="text-placeholder text-xs font-medium">
                {filteredRegistrations.length} {filteredRegistrations.length === 1 ? 'event' : 'events'}
              </Text>
            </View>

            {filteredRegistrations.length === 0 ? (
              <View className="mt-14 items-center">
                <View className="w-14 h-14 rounded-full bg-surface items-center justify-center mb-3">
                  <Feather name="filter" size={22} color="#9CA3AF" />
                </View>
                <Text className="text-white text-base font-bold mb-1">No {filterTab.toLowerCase()} events</Text>
                <Text className="text-placeholder text-xs text-center px-4">
                  You don't have any race registrations marked as {filterTab.toLowerCase()}.
                </Text>
                <TouchableOpacity 
                  className="mt-4 px-4 py-2 bg-surface rounded-xl border border-[#243249]"
                  onPress={() => setFilterTab('All')}
                >
                  <Text className="text-primary font-bold text-xs">View All Events</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredRegistrations.map((reg: any) => {
                const race = reg.race;
            const isCompleted = reg.paymentStatus === 'COMPLETED';
            const hasSubmitted = Boolean(reg.has_submitted_time || reg.finishing_time || reg.hasSubmittedTime);
            const moderationStatus = reg.result_moderation_status || reg.resultModerationStatus || 'PENDING';
            const isApproved = moderationStatus === 'APPROVED';
            const isRejected = moderationStatus === 'REJECTED';

            return (
              <View key={reg.id} className="bg-surface rounded-2xl overflow-hidden mb-5 border border-[#243249]">
                <Image 
                  source={{ uri: race?.bibTemplateUrl || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80' }} 
                  className="h-[100px] w-full" 
                />
                <View className="p-4 flex-col gap-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className={`px-2 py-1 rounded-md flex-row items-center gap-1 ${isCompleted ? 'bg-[#CCFF00]/10' : 'bg-[#FF4C29]/10'}`}>
                        <Feather name={isCompleted ? 'check-circle' : 'clock'} size={12} color={isCompleted ? '#CCFF00' : '#FF4C29'} />
                        <Text className={`font-bold text-xs ${isCompleted ? 'text-[#CCFF00]' : 'text-[#FF4C29]'}`}>
                          {isCompleted ? 'PAID' : 'PENDING PAYMENT'}
                        </Text>
                      </View>
                      {hasSubmitted && (
                        <View className={`px-2 py-1 rounded-md flex-row items-center gap-1 ${
                          isApproved 
                            ? 'bg-[#CCFF00]/10 border border-[#CCFF00]/20' 
                            : isRejected 
                              ? 'bg-red-500/10 border border-red-500/20' 
                              : 'bg-yellow-500/10 border border-yellow-500/20'
                        }`}>
                          <Feather 
                            name={isApproved ? 'check-circle' : isRejected ? 'x-circle' : 'clock'} 
                            size={11} 
                            color={isApproved ? '#CCFF00' : isRejected ? '#EF4444' : '#EAB308'} 
                          />
                          <Text className={`font-bold text-[11px] ${
                            isApproved 
                              ? 'text-[#CCFF00]' 
                              : isRejected 
                                ? 'text-red-400' 
                                : 'text-yellow-400'
                          }`}>
                            {isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : 'UNDER REVIEW'}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-primary font-bold text-sm">KES {race?.fee}</Text>
                  </View>

                  <View>
                    <Text className="text-white font-bold text-lg mb-1">{race?.name}</Text>
                    <Text className="text-[#9CA3AF] text-sm mb-3">
                      {new Date(race?.raceDate).toLocaleDateString()} • {race?.distance}
                    </Text>
                  </View>

                  {isCompleted ? (
                    <View className="flex-row gap-2">
                      <TouchableOpacity 
                        className="flex-1 bg-[#1E2A3E] py-3 rounded-xl items-center flex-row justify-center gap-2"
                        onPress={() => navigation.navigate('DigitalBib', { registrationId: reg.id })}
                      >
                        <Feather name="credit-card" size={16} color="#fff" />
                        <Text className="text-white font-bold">Digital Bib</Text>
                      </TouchableOpacity>

                      {isRejected ? (
                        <TouchableOpacity 
                          className="flex-1 bg-red-600/20 border border-red-500/30 py-3 rounded-xl items-center flex-row justify-center gap-2"
                          onPress={() => navigation.navigate('SubmitTime', { registrationId: reg.id, raceName: race?.name, distance: race?.distance })}
                        >
                          <Feather name="refresh-cw" size={15} color="#EF4444" />
                          <Text className="text-red-400 font-bold text-xs">Re-submit Time</Text>
                        </TouchableOpacity>
                      ) : hasSubmitted ? (
                        <TouchableOpacity 
                          className="flex-1 bg-[#1E2A3E] border border-[#243249] py-2.5 px-3 rounded-xl items-center flex-row justify-center gap-2"
                          onPress={() => navigation.navigate('Leaderboard')}
                        >
                          <Feather 
                            name={isApproved ? "check-circle" : "clock"} 
                            size={16} 
                            color={isApproved ? "#CCFF00" : "#EAB308"} 
                          />
                          <View className="flex-col items-start">
                            <Text className={isApproved ? "text-[#CCFF00] font-bold text-[10px] uppercase" : "text-yellow-400 font-bold text-[10px] uppercase"}>
                              {isApproved ? 'VERIFIED TIME' : 'TIME SUBMITTED'}
                            </Text>
                            <Text className="text-white font-mono font-bold text-xs" numberOfLines={1}>
                              {reg.finishing_time || 'Under Review'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity 
                          className="flex-1 bg-primary py-3 rounded-xl items-center flex-row justify-center gap-2 shadow-lg shadow-primary/20"
                          onPress={() => navigation.navigate('SubmitTime', { registrationId: reg.id, raceName: race?.name, distance: race?.distance })}
                        >
                          <Feather name="upload-cloud" size={16} color="#fff" />
                          <Text className="text-white font-bold">Submit Time</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <TouchableOpacity 
                      className="w-full bg-primary py-3 rounded-xl items-center flex-row justify-center gap-2 shadow-lg shadow-primary/20"
                      onPress={() => navigation.navigate('Checkout', { raceId: race?.id })}
                    >
                      <Feather name="arrow-right-circle" size={16} color="#fff" />
                      <Text className="text-white font-bold">Complete Payment</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </>
    )}
      </ScrollView>

      {/* Bottom Nav */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-[#243249]">
        <View className="flex-row items-center justify-between px-4 pt-3 pb-6">
          <TouchableOpacity className="items-center gap-1 w-[72px]" onPress={() => navigation.navigate('Explore')}>
            <Feather name="compass" size={22} color="#9CA3AF" />
            <Text className="text-[#9CA3AF] font-semibold text-[11px]">Explore</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center gap-1 w-[72px]" onPress={() => navigation.navigate('Leaderboard')}>
            <Feather name="award" size={22} color="#9CA3AF" />
            <Text className="text-[#9CA3AF] font-semibold text-[11px]">Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center gap-1 w-[72px]">
            <Feather name="calendar" size={22} color="#FF4C29" />
            <Text className="text-primary font-semibold text-[11px]">My Events</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center gap-1 w-[72px]" onPress={() => navigation.navigate('Profile')}>
            <Feather name="user" size={22} color="#9CA3AF" />
            <Text className="text-[#9CA3AF] font-semibold text-[11px]">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
