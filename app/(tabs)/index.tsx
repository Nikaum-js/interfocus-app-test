import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  RefreshControl,
  Animated,
  View,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/Text';
import { TaskItem } from '@/components/TaskItem';
import { AddTaskModal } from '@/components/AddTaskModal';
import { useAuth } from '@/hooks/useAuth';
import { useTodos } from '@/hooks/useTodos';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { TaskStatus } from '@/services/todoService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FILTER_OPTIONS: { label: string; value: TaskStatus; icon: string }[] = [
  { label: 'Abertas', value: 'pendente', icon: 'time-outline' },
  { label: 'Concluídas', value: 'concluida', icon: 'checkmark-circle' },
  { label: 'Todas', value: 'todas', icon: 'list' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const { 
    tasks, 
    loading, 
    error, 
    stats,
    selectedTasks,
    isMultiSelectMode,
    currentFilter,
    addTask,
    deleteTasksWithDelay,
    markTasksAsCompleted,
    toggleTaskSelection,
    startMultiSelect,
    selectAllTasks,
    applyFilter,
    clearError,
    hasSelectedTasks,
    selectedCount,
    canMarkAsCompleted
  } = useTodos(user?.id || null);
  const areAllTasksSelected = tasks.length > 0 && selectedTasks.length === tasks.length;


  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isMultiSelectMode) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [isMultiSelectMode]);

  const handleDeleteSelected = () => {
    if (!hasSelectedTasks) return;

    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir ${selectedCount} tarefa${selectedCount > 1 ? 's' : ''}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteTasksWithDelay(selectedTasks);
            if (success) {
              Alert.alert('Sucesso', `${selectedCount} tarefa${selectedCount > 1 ? 's excluídas' : ' excluída'}`);
            }
          }
        }
      ]
    );
  };

  const handleMarkAsCompleted = async () => {
    if (!canMarkAsCompleted) return;

    const pendingTasks = selectedTasks.filter(id => {
      const task = tasks.find(t => t.id === id);
      return task?.status === 'pendente';
    });

    const success = await markTasksAsCompleted(pendingTasks);
    if (success) {
      Alert.alert('Sucesso', `${pendingTasks.length} tarefa${pendingTasks.length > 1 ? 's marcadas' : ' marcada'} como concluída${pendingTasks.length > 1 ? 's' : ''}`);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await applyFilter(currentFilter);
    setRefreshing(false);
  };

  const renderTaskItem = ({ item }: { item: any }) => (
    <TaskItem
      task={item}
      isSelected={selectedTasks.includes(item.id)}
      isMultiSelectMode={isMultiSelectMode}
      onPress={() => {}}
      onLongPress={() => startMultiSelect(item.id)}
      onToggleSelection={() => toggleTaskSelection(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name={currentFilter === 'pendente' ? 'checkmark-done' : 'document-text-outline'} 
        size={64} 
        color={colors.text + '40'} 
      />
      <Text style={[styles.emptyTitle, { color: colors.text + '80' }]}>
        {currentFilter === 'pendente' 
          ? 'Nenhuma tarefa aberta' 
          : currentFilter === 'concluida'
          ? 'Nenhuma tarefa concluída'
          : 'Nenhuma tarefa encontrada'
        }
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.text + '60' }]}>
        {currentFilter === 'pendente' 
          ? 'Você está em dia! Que tal criar uma nova tarefa?'
          : currentFilter === 'concluida'
          ? 'Complete algumas tarefas para vê-las aqui'
          : 'Comece criando sua primeira tarefa'
        }
      </Text>
    </View>
  );

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle" size={48} color="#F44336" />
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          Erro ao carregar tarefas
        </Text>
        <Text style={[styles.errorSubtitle, { color: colors.text + '80' }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.tint }]}
          onPress={clearError}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={
          colorScheme === 'dark' 
            ? ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']
            : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']
        }
        style={styles.headerGradient}
      >
        <View style={[styles.header, { borderBottomColor: colors.text + '15' }]}>
          <View style={styles.headerLeft}>
            <Text type="title" style={[styles.headerTitle, { color: colors.text }]}>
              Minhas Tarefas
            </Text>
            {user && (
              <Text style={[styles.userGreeting, { color: colors.text + '70' }]}>
                Olá, {user.name}! 👋
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={[colors.tint + '20', colors.tint + '10']}
            style={styles.statGradient}
          >
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.tint }]}>
                {stats.total}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text + '80' }]}>
                Total
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['#FF980020', '#FF980010']}
            style={styles.statGradient}
          >
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#FF9800' }]}>
                {stats.abertas}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text + '80' }]}>
                Abertas
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['#4CAF5020', '#4CAF5010']}
            style={styles.statGradient}
          >
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
                {stats.concluidas}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text + '80' }]}>
                Concluídas
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        {FILTER_OPTIONS.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterButton,
              currentFilter === filter.value && styles.filterButtonActive
            ]}
            onPress={() => applyFilter(filter.value)}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                currentFilter === filter.value 
                  ? [colors.tint + '25', colors.tint + '15']
                  : colorScheme === 'dark'
                    ? ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']
                    : ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)']
              }
              style={styles.filterGradient}
            >
              <Ionicons 
                name={filter.icon as any} 
                size={16} 
                color={currentFilter === filter.value ? colors.tint : colors.text + '80'} 
              />
              <Text style={[
                styles.filterButtonText,
                { 
                  color: currentFilter === filter.value 
                    ? colors.tint 
                    : colors.text + '80',
                  fontWeight: currentFilter === filter.value ? '600' : '500'
                }
              ]}>
                {filter.label}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {isMultiSelectMode && (
        <Animated.View 
          style={[
            styles.multiSelectContainer,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                })
              }]
            }
          ]}
        >
          <LinearGradient
            colors={
              colorScheme === 'dark' 
                ? ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)']
                : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']
            }
            style={styles.multiSelectGradient}
          >
            <View style={styles.multiSelectInfo}>
              <View style={styles.selectedInfo}>
                <Text style={[styles.selectedCount, { color: colors.text }]}>
                  {selectedCount} selecionada{selectedCount > 1 ? 's' : ''}
                </Text>
                <TouchableOpacity 
                  onPress={selectAllTasks}
                  style={[styles.selectAllButton, { backgroundColor: colors.tint + '20' }]}
                >
                  <Text style={[styles.selectAllText, { color: colors.tint }]}>
                    {areAllTasksSelected ? 'Desmarcar' : 'Todas'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.actionButtons}>
                {canMarkAsCompleted && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={handleMarkAsCompleted}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={['#4CAF50', '#45A049']}
                      style={styles.actionButtonGradient}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDeleteSelected}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#F44336', '#E53935']}
                    style={styles.actionButtonGradient}
                  >
                    <Ionicons name="trash" size={18} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
                
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        style={styles.tasksList}
        contentContainerStyle={[
          tasks.length === 0 ? styles.emptyList : undefined,
          { 
            paddingBottom: Platform.OS === 'android' 
              ? 120 + Math.max(insets.bottom, 20) 
              : 120 
          }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="large" color={colors.tint} />
              <Text style={[styles.loadingText, { color: colors.text + '80' }]}>
                Carregando tarefas...
              </Text>
            </View>
          ) : null
        }
      />

      {!isMultiSelectMode && (
        <View style={[
          styles.addButtonContainer,
          {
            bottom: Platform.OS === 'android' ? 120 + Math.max(insets.bottom, 20) : 120,
          }
        ]}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.tint, colors.tint + 'DD']}
              style={styles.addButtonGradient}
            >
              <View style={styles.addButtonInner}>
                <Ionicons name="add" size={28} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      <AddTaskModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addTask}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  userGreeting: {
    fontSize: 16,
    marginTop: 4,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  headerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  filterButtonActive: {
    shadowRadius: 12,
  },
  filterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButtonText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  multiSelectContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  multiSelectGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  multiSelectInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  selectedCount: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  selectAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 4,
  },
  selectAllText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
  },
  completeButton: {},
  deleteButton: {},
  cancelButton: {},
  actionButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksList: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingFooter: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  addButtonContainer: {
    position: 'absolute',
    right: 20,
    width: 48,
    height: 18,
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  addButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerGradient: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerButtonGradient: {
    padding: 12,
    borderRadius: 12,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
