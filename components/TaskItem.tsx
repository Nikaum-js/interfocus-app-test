import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Pressable, Animated, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Task } from '@/services/todoService';
import { LinearGradient } from 'expo-linear-gradient';

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  isMultiSelectMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onToggleSelection: () => void;
}

export function TaskItem({ 
  task, 
  isSelected, 
  isMultiSelectMode, 
  onPress, 
  onLongPress, 
  onToggleSelection 
}: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  
  const expandAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const selectionAnimation = useRef(new Animated.Value(0)).current;
  const pressAnimation = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const selectionGlowAnimation = useRef(new Animated.Value(0)).current;
  const selectionScaleAnimation = useRef(new Animated.Value(1)).current;

  const formatDate = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' | 'selection') => {
    try {
      if (Platform.OS === 'ios') {
        switch (type) {
          case 'light':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case 'selection':
            await Haptics.selectionAsync();
            break;
        }
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  };

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 0.97,
        useNativeDriver: true,
        tension: 100,
        friction: 7
      }),
      Animated.timing(pressAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      })
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 7
      }),
      Animated.timing(pressAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      })
    ]).start();
  };

  const handlePress = async () => {
    if (isMultiSelectMode) {
      await triggerHaptic('selection');
      
      
      Animated.parallel([
        Animated.sequence([
          Animated.timing(selectionScaleAnimation, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true
          }),
          Animated.spring(selectionScaleAnimation, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 6
          })
        ]),
        Animated.sequence([
          Animated.timing(selectionGlowAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
          }),
          Animated.timing(selectionGlowAnimation, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true
          })
        ])
      ]).start();
      
      onToggleSelection();
    } else {
      await triggerHaptic('light');
      const newExpanded = !isExpanded;
      setIsExpanded(newExpanded);
      
      Animated.timing(expandAnimation, {
        toValue: newExpanded ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
      onPress();
    }
  };

  const handleLongPress = async () => {
    await triggerHaptic('medium');
    onLongPress();
  };

  const getStatusColor = () => {
    return task.status === 'concluida' ? '#22C55E' : '#F59E0B';
  };

  const getStatusGradient = () => {
    return task.status === 'concluida' 
      ? ['#22C55E', '#16A34A'] as const
      : ['#F59E0B', '#D97706'] as const;
  };

  const getStatusIcon = () => {
    return task.status === 'concluida' ? 'checkmark-circle' : 'time-outline';
  };

  
  useEffect(() => {
    Animated.parallel([
      Animated.spring(selectionAnimation, {
        toValue: isSelected ? 1 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 7
      }),
      Animated.timing(glowAnimation, {
        toValue: isSelected ? 1 : 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  }, [isSelected]);

  const containerScale = scaleAnimation;

  const descriptionHeight = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  const descriptionOpacity = expandAnimation.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0, 1]
  });

  const rotateChevron = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  const selectionGlow = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15]
  });

  const selectionPulse = selectionGlowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20]
  });

  const containerOpacity = pressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95]
  });


  const selectionBackgroundOpacity = selectionAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.04]
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { 
          transform: [
            { scale: containerScale },
            { scale: selectionScaleAnimation }
          ],
          opacity: containerOpacity,
        }
      ]}
    >
      {isSelected && (
        <Animated.View
          style={[
            styles.selectionOverlay,
            {
              backgroundColor: colors.tint,
              opacity: selectionBackgroundOpacity,
            }
          ]}
        />
      )}

      <Animated.View
        style={[
          styles.innerContainer,
        ]}
      >
        {isSelected && (
          <Animated.View
            style={[
              styles.glowEffect,
              {
                shadowRadius: selectionPulse,
                shadowColor: colors.tint,
                shadowOpacity: selectionGlowAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.2]
                }),
              }
            ]}
          />
        )}

        <LinearGradient
          colors={
            isSelected
              ? [colors.tint + '08', colors.tint + '04']
              : colorScheme === 'dark' 
                ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']
                : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
          }
          style={styles.gradientContainer}
        >
          <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onLongPress={handleLongPress}
            delayLongPress={500}
            style={styles.pressable}
          > 
            <View style={styles.header}>
              {isMultiSelectMode && (
                <Animated.View
                  style={[
                    styles.checkboxContainer,
                    {
                      transform: [{
                        scale: selectionAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 1.2]
                        })
                      }]
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      { 
                        backgroundColor: isSelected ? colors.tint : 'transparent',
                        borderColor: colors.tint,
                        shadowColor: colors.tint,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isSelected ? 0.3 : 0,
                        shadowRadius: 4,
                        elevation: isSelected ? 4 : 0,
                      }
                    ]}
                    onPress={onToggleSelection}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <Animated.View
                        style={{
                          transform: [{
                            scale: selectionAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 1.1]
                            })
                          }]
                        }}
                      >
                        <Ionicons name="checkmark" size={18} color="white" />
                      </Animated.View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              )}

              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <Text 
                    style={[
                      styles.title,
                      { 
                        color: isSelected ? colors.text : colors.text,
                        fontWeight: isSelected ? '700' : '700'
                      },
                      task.status === 'concluida' && styles.completedTitle
                    ]}
                    numberOfLines={isExpanded ? undefined : 2}
                  >
                    {task.title}
                  </Text>
                </View>

                <View style={styles.dateContainer}>
                  <Ionicons 
                    name="calendar-outline" 
                    size={12} 
                    color={colors.text + '60'} 
                    style={styles.dateIcon}
                  />
                  <Text style={[
                    styles.date, 
                    { 
                      color: colors.text + '80'
                    }
                  ]}>
                    {formatDate(task.createdAt)}
                  </Text>
                </View>

                {task.description && (
                  <Animated.View
                    style={[
                      styles.descriptionContainer,
                      {
                        maxHeight: descriptionHeight,
                        opacity: descriptionOpacity,
                      }
                    ]}
                  >
                    <View style={[
                      styles.descriptionDivider, 
                      { 
                        backgroundColor: colors.text + '20' 
                      }
                    ]} />
                    <View style={styles.descriptionContent}>
                      <Text 
                        style={[
                          styles.description, 
                          { 
                            color: colors.text + 'DD'
                          }
                        ]}
                        numberOfLines={3}
                      >
                        {task.description}
                      </Text>
                    </View>
                  </Animated.View>
                )}
              </View>

              <View style={styles.headerActions}>
                <View style={styles.statusIconContainer}>
                  <LinearGradient
                    colors={getStatusGradient()}
                    style={styles.statusIconGradient}
                  >
                    <Ionicons 
                      name={getStatusIcon()} 
                      size={18} 
                      color="white" 
                    />
                  </LinearGradient>
                </View>

                {!isMultiSelectMode && (
                  <Animated.View
                    style={[
                      styles.expandButtonContainer,
                      {
                        transform: [{ rotate: rotateChevron }]
                      }
                    ]}
                  >
                    <TouchableOpacity 
                      style={[
                        styles.expandButton,
                        { 
                          backgroundColor: colors.text + '10',
                          borderWidth: 0,
                          borderColor: 'transparent',
                        }
                      ]}
                      onPress={() => handlePress()}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name="chevron-down"
                        size={18} 
                        color={colors.text + '80'} 
                      />
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
            </View>

            <View style={styles.statusBadgeContainer}>
              <LinearGradient
                colors={[getStatusColor() + '20', getStatusColor() + '10']}
                style={[
                  styles.statusBadge,
                  isSelected && {
                    shadowColor: getStatusColor(),
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 2
                  }
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                <Text style={[
                  styles.statusText, 
                  { 
                    color: getStatusColor(),
                    fontWeight: '600'
                  }
                ]}>
                  {task.status === 'concluida' ? 'Concluída' : 'Em Andamento'}
                </Text>
              </LinearGradient>
            </View>
          </Pressable>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  innerContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  gradientContainer: {
    borderRadius: 16,
  },
  pressable: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  checkboxContainer: {
    marginTop: 4,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  statusIconContainer: {
    marginTop: 2,
  },
  statusIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateIcon: {
    marginRight: 6,
  },
  date: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  descriptionContainer: {
    overflow: 'hidden',
    width: '100%',
  },
  descriptionDivider: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 0,
  },
  descriptionContent: {
    paddingBottom: 4,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: -0.1,
  },
  expandButtonContainer: {
    marginTop: 2,
    marginRight: 10,
  },
  expandButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeContainer: {
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
}); 