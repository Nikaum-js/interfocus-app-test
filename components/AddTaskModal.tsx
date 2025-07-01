import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string) => Promise<boolean>;
  loading: boolean;
}

export function AddTaskModal({ visible, onClose, onSubmit, loading }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  
  useEffect(() => {
    if (!visible) {
      setTitle('');
      setDescription('');
      setTitleError('');
    }
  }, [visible]);

  const validateForm = () => {
    if (!title.trim()) {
      setTitleError('Título é obrigatório');
      return false;
    }
    if (title.trim().length < 3) {
      setTitleError('Título deve ter pelo menos 3 caracteres');
      return false;
    }
    setTitleError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || loading) return;

    try {
      const success = await onSubmit(title.trim(), description.trim());
      
      if (success) {
        onClose();
      } else {
        Alert.alert('Erro', 'Não foi possível criar a tarefa');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao criar a tarefa');
    }
  };

  const canSubmit = title.trim().length >= 3 && !loading;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <LinearGradient
            colors={
              colorScheme === 'dark' 
                ? ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']
                : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']
            }
            style={styles.headerGradient}
          >
            <View style={[styles.header, { borderBottomColor: colors.text + '15' }]}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View style={[styles.closeButtonContainer, { backgroundColor: colors.text + '15' }]}>
                  <Ionicons name="close" size={20} color={colors.text} />
                </View>
              </TouchableOpacity>

              <View style={styles.headerCenter}>
                <View style={[styles.headerIconContainer, { backgroundColor: colors.tint + '20' }]}>
                  <Ionicons name="add-circle" size={24} color={colors.tint} />
                </View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Nova Tarefa
                </Text>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={!canSubmit}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    canSubmit 
                      ? [colors.tint, colors.tint + 'DD']
                      : [colors.text + '30', colors.text + '20']
                  }
                  style={styles.submitButtonGradient}
                >
                  {loading ? (
                    <Text style={styles.submitButtonText}>
                      Salvando...
                    </Text>
                  ) : (
                    <Text style={styles.submitButtonText}>
                      Salvar
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              <View style={styles.fieldCard}>
                <LinearGradient
                  colors={
                    titleError
                      ? ['#F4433620', '#F4433610']
                      : colorScheme === 'dark'
                        ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']
                        : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
                  }
                  style={styles.fieldGradient}
                >
                  <View style={styles.fieldHeader}>
                    <View style={[
                      styles.fieldIconContainer,
                      { backgroundColor: titleError ? '#F4433620' : colors.tint + '20' }
                    ]}>
                      <Ionicons 
                        name="text" 
                        size={16} 
                        color={titleError ? '#F44336' : colors.tint} 
                      />
                    </View>
                    <Text style={[styles.label, { color: colors.text }]}>
                      Título *
                    </Text>
                    <Text style={[styles.characterCount, { color: colors.text + '60' }]}>
                      {title.length}/100
                    </Text>
                  </View>
                  
                  <TextInput
                    style={[
                      styles.titleInput,
                      {
                        color: colors.text,
                        borderColor: titleError ? '#F44336' : 'transparent',
                      },
                    ]}
                    value={title}
                    onChangeText={(text) => {
                      setTitle(text);
                      if (titleError) setTitleError('');
                    }}
                    placeholder="Digite o título da tarefa"
                    placeholderTextColor={colors.text + '50'}
                    maxLength={100}
                    editable={!loading}
                    multiline
                    textAlignVertical="top"
                  />
                  
                  {titleError ? (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={14} color="#F44336" />
                      <Text style={styles.errorText}>{titleError}</Text>
                    </View>
                  ) : null}
                </LinearGradient>
              </View>

              <View style={styles.fieldCard}>
                <LinearGradient
                  colors={
                    colorScheme === 'dark'
                      ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']
                      : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
                  }
                  style={styles.fieldGradient}
                >
                  <View style={styles.fieldHeader}>
                    <View style={[styles.fieldIconContainer, { backgroundColor: colors.tint + '20' }]}>
                      <Ionicons name="document-text" size={16} color={colors.tint} />
                    </View>
                    <Text style={[styles.label, { color: colors.text }]}>
                      Descrição
                    </Text>
                    <Text style={[styles.characterCount, { color: colors.text + '60' }]}>
                      {description.length}/500
                    </Text>
                  </View>
                  
                  <TextInput
                    style={[
                      styles.descriptionInput,
                      { color: colors.text }
                    ]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Digite uma descrição para a tarefa (opcional)"
                    placeholderTextColor={colors.text + '50'}
                    maxLength={500}
                    editable={!loading}
                    multiline
                    textAlignVertical="top"
                  />
                </LinearGradient>
              </View>

              <View style={styles.infoCard}>
                <LinearGradient
                  colors={[colors.tint + '15', colors.tint + '08']}
                  style={styles.infoGradient}
                >
                  <View style={[styles.infoIconContainer, { backgroundColor: colors.tint + '25' }]}>
                    <Ionicons name="information-circle" size={18} color={colors.tint} />
                  </View>
                  <Text style={[styles.infoText, { color: colors.tint }]}>
                    A data e hora de criação serão definidas automaticamente quando a tarefa for salva.
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  headerGradient: {
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonContainer: {
    padding: 8,
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'center',
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 18,
    gap: 20,
  },
  fieldCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  fieldGradient: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  fieldIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
    flex: 1,
  },
  characterCount: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    minHeight: 60,
    maxHeight: 100,
    padding: 0,
    textAlignVertical: 'top',
  },
  descriptionInput: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    minHeight: 80,
    maxHeight: 150,
    padding: 0,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
  },
  infoCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    flex: 1,
  },
}); 