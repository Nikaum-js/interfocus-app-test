import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  status: "pendente" | "concluida";
  userId: string;
}

export type TaskStatus = "pendente" | "concluida" | "todas";

// Constantes privadas.
const TASKS_KEY = "interfocus_tasks_";
const USER_INIT_KEY = "interfocus_user_initialized_";

/**
 * Gera chave única para cada usuário
 */
function getUserTasksKey(userId: string): string {
  return `${TASKS_KEY}${userId}`;
}

/**
 * Gera chave para rastrear se usuário já foi inicializado
 */
function getUserInitKey(userId: string): string {
  return `${USER_INIT_KEY}${userId}`;
}

/**
 * Verifica se é o primeiro login do usuário
 */
async function isFirstLogin(userId: string): Promise<boolean> {
  try {
    const initKey = getUserInitKey(userId);
    const isInitialized = await AsyncStorage.getItem(initKey);
    return isInitialized === null;
  } catch (error) {
    console.error("📋 TodoService: Erro ao verificar primeiro login:", error);
    return false;
  }
}

/**
 * Marca o usuário como inicializado
 */
async function markUserAsInitialized(userId: string): Promise<void> {
  try {
    const initKey = getUserInitKey(userId);
    await AsyncStorage.setItem(initKey, "true");
  } catch (error) {
    console.error(
      "📋 TodoService: Erro ao marcar usuário como inicializado:",
      error
    );
  }
}

/**
 * Gera 50 tarefas fictícias para um usuário
 */
function generateRandomTasks(userId: string): Task[] {
  const taskTitles = [
    "Revisar documentação do projeto",
    "Implementar autenticação OAuth",
    "Corrigir bug na tela de login",
    "Atualizar dependências do projeto",
    "Criar testes unitários",
    "Otimizar performance da aplicação",
    "Implementar dark mode",
    "Revisar pull requests",
    "Documentar APIs",
    "Configurar CI/CD",
    "Refatorar componentes",
    "Implementar cache local",
    "Corrigir responsividade",
    "Adicionar validação de formulários",
    "Implementar push notifications",
    "Otimizar imagens",
    "Configurar analytics",
    "Implementar offline mode",
    "Revisar código legacy",
    "Atualizar README",
    "Configurar linting",
    "Implementar lazy loading",
    "Corrigir memory leaks",
    "Adicionar interceptors HTTP",
    "Implementar paginação",
    "Configurar ambiente de desenvolvimento",
    "Implementar sistema de logs",
    "Otimizar bundle size",
    "Configurar ESLint",
    "Implementar Redux/Context",
    "Adicionar loading states",
    "Configurar TypeScript",
    "Implementar error boundaries",
    "Adicionar skeleton screens",
    "Configurar prettier",
    "Implementar deep linking",
    "Otimizar renderização",
    "Configurar debugging",
    "Implementar animações",
    "Adicionar feedback visual",
    "Configurar splash screen",
    "Implementar biometria",
    "Otimizar queries de banco",
    "Configurar monitoramento",
    "Implementar backup de dados",
    "Adicionar compressão de imagens",
    "Configurar rate limiting",
    "Implementar websockets",
    "Otimizar SEO",
    "Configurar deployment",
  ];

  const descriptions = [
    "Tarefa importante para manter a qualidade do código",
    "Implementação necessária para melhorar a experiência do usuário",
    "Correção crítica que precisa ser feita com urgência",
    "Melhoria que irá otimizar o desempenho da aplicação",
    "Tarefa de manutenção para manter o projeto atualizado",
    "Implementação de nova funcionalidade solicitada",
    "Refatoração necessária para manter a legibilidade",
    "Configuração importante para o ambiente de produção",
    "Tarefa de documentação para facilitar manutenção futura",
    "Otimização necessária para melhorar a performance",
  ];

  const tasks: Task[] = [];

  for (let i = 0; i < 50; i++) {
    const randomTitle =
      taskTitles[Math.floor(Math.random() * taskTitles.length)];
    const randomDescription =
      descriptions[Math.floor(Math.random() * descriptions.length)];

    const randomDaysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - randomDaysAgo);
    createdAt.setHours(Math.floor(Math.random() * 24));
    createdAt.setMinutes(Math.floor(Math.random() * 60));

    const status: "pendente" | "concluida" =
      Math.random() < 0.7 ? "pendente" : "concluida";

    tasks.push({
      id: `task_${userId}_${i}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      title: `${randomTitle} #${i + 1}`,
      description: randomDescription,
      createdAt,
      status,
      userId,
    });
  }

  return tasks.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

/**
 * Salva as tarefas de um usuário
 */
async function saveTasks(userId: string, tasks: Task[]): Promise<void> {
  try {
    const key = getUserTasksKey(userId);
    await AsyncStorage.setItem(key, JSON.stringify(tasks));
  } catch (error) {
    console.error("💾 TodoService: Erro ao salvar tarefas:", error);
    throw error;
  }
}

/**
 * Obtém todas as tarefas de um usuário
 */
export async function getUserTasks(userId: string): Promise<Task[]> {
  try {
    const isFirst = await isFirstLogin(userId);

    const key = getUserTasksKey(userId);

    const tasksJson = await AsyncStorage.getItem(key);

    if (isFirst && !tasksJson) {
      const newTasks = generateRandomTasks(userId);

      await saveTasks(userId, newTasks);
      await markUserAsInitialized(userId);

      return newTasks;
    }

    if (tasksJson) {
      const tasks: Task[] = JSON.parse(tasksJson);

      if (isFirst) {
        await markUserAsInitialized(userId);
      }

      return tasks
        .map((task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
        }))
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    return [];
  } catch (error) {
    console.error("📋 TodoService: Erro ao obter tarefas do usuário:", error);
    return [];
  }
}

/**
 * Adiciona uma nova tarefa
 */
export async function addTask(
  userId: string,
  title: string,
  description: string
): Promise<Task> {
  try {
    const tasks = await getUserTasks(userId);

    const newTask: Task = {
      id: `task_${userId}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      title,
      description,
      createdAt: new Date(),
      status: "pendente",
      userId,
    };

    tasks.push(newTask);
    await saveTasks(userId, tasks);

    return newTask;
  } catch (error) {
    console.error("Erro ao adicionar tarefa:", error);
    throw error;
  }
}

/**
 * Atualiza uma tarefa existente
 */
export async function updateTask(
  userId: string,
  taskId: string,
  updates: Partial<Task>
): Promise<Task | null> {
  try {
    const tasks = await getUserTasks(userId);
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      return null;
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    await saveTasks(userId, tasks);

    return tasks[taskIndex];
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    throw error;
  }
}

/**
 * Remove uma tarefa
 */
export async function deleteTask(
  userId: string,
  taskId: string
): Promise<boolean> {
  try {
    const tasks = await getUserTasks(userId);
    const filteredTasks = tasks.filter((task) => task.id !== taskId);

    if (filteredTasks.length === tasks.length) {
      return false;
    }

    await saveTasks(userId, filteredTasks);
    return true;
  } catch (error) {
    console.error("Erro ao remover tarefa:", error);
    throw error;
  }
}

/**
 * Remove múltiplas tarefas
 */
export async function deleteTasks(
  userId: string,
  taskIds: string[]
): Promise<number> {
  try {
    const tasks = await getUserTasks(userId);
    const filteredTasks = tasks.filter((task) => !taskIds.includes(task.id));

    const deletedCount = tasks.length - filteredTasks.length;

    if (deletedCount > 0) {
      await saveTasks(userId, filteredTasks);
    }

    return deletedCount;
  } catch (error) {
    console.error("Erro ao remover tarefas:", error);
    throw error;
  }
}

/**
 * Marca múltiplas tarefas como concluídas
 */
export async function markTasksAsCompleted(
  userId: string,
  taskIds: string[]
): Promise<number> {
  try {
    const tasks = await getUserTasks(userId);
    let updatedCount = 0;

    for (const task of tasks) {
      if (taskIds.includes(task.id) && task.status === "pendente") {
        task.status = "concluida";
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      await saveTasks(userId, tasks);
    }

    return updatedCount;
  } catch (error) {
    console.error("Erro ao marcar tarefas como concluídas:", error);
    throw error;
  }
}

/**
 * Filtra tarefas por status
 */
export async function getFilteredTasks(
  userId: string,
  status: TaskStatus = "todas"
): Promise<Task[]> {
  try {
    const tasks = await getUserTasks(userId);

    if (status === "todas") {
      return tasks;
    }

    return tasks.filter((task) => task.status === status);
  } catch (error) {
    console.error("Erro ao filtrar tarefas:", error);
    return [];
  }
}

/**
 * Obtém estatísticas das tarefas
 */
export async function getTaskStats(userId: string): Promise<{
  total: number;
  abertas: number;
  concluidas: number;
}> {
  try {
    const tasks = await getUserTasks(userId);

    return {
      total: tasks.length,
      abertas: tasks.filter((task) => task.status === "pendente").length,
      concluidas: tasks.filter((task) => task.status === "concluida").length,
    };
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    return { total: 0, abertas: 0, concluidas: 0 };
  }
}
