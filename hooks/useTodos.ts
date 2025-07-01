import {
  Task,
  TaskStatus,
  addTask as addTaskService,
  deleteTasks as deleteTasksService,
  getFilteredTasks,
  getTaskStats,
  markTasksAsCompleted as markTasksAsCompletedService,
} from "@/services/todoService";
import { useCallback, useEffect, useState } from "react";

export interface TodoState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    abertas: number;
    concluidas: number;
  };
}

export function useTodos(userId: string | null) {
  const [state, setState] = useState<TodoState>({
    tasks: [],
    loading: true,
    error: null,
    stats: { total: 0, abertas: 0, concluidas: 0 },
  });

  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<TaskStatus>("pendente");

  const loadTasks = useCallback(
    async (filter: TaskStatus = "pendente") => {
      if (!userId) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const [tasks, stats] = await Promise.all([
          getFilteredTasks(userId, filter),
          getTaskStats(userId),
        ]);

        const sortedTasks = tasks.sort((a, b) => {
          if (
            filter === "pendente" ||
            (filter === "todas" &&
              a.status === "pendente" &&
              b.status === "pendente")
          ) {
            return a.createdAt.getTime() - b.createdAt.getTime();
          } else {
            return b.createdAt.getTime() - a.createdAt.getTime();
          }
        });

        setState({
          tasks: sortedTasks,
          loading: false,
          error: null,
          stats,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Erro ao carregar tarefas",
        }));
      }
    },
    [userId]
  );

  const addTask = useCallback(
    async (title: string, description: string): Promise<boolean> => {
      if (!userId) return false;

      try {
        setState((prev) => ({ ...prev, loading: true }));

        await addTaskService(userId, title, description);
        await loadTasks(currentFilter);

        return true;
      } catch (error) {
        console.error("Erro ao adicionar tarefa:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Erro ao adicionar tarefa",
        }));
        return false;
      }
    },
    [userId, loadTasks, currentFilter]
  );

  const deleteTasksWithDelay = useCallback(
    async (taskIds: string[]): Promise<boolean> => {
      if (!userId) return false;

      try {
        setState((prev) => ({ ...prev, loading: true }));

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const deletedCount = await deleteTasksService(userId, taskIds);

        if (deletedCount > 0) {
          await loadTasks(currentFilter);
          setSelectedTasks([]);
          setIsMultiSelectMode(false);
          return true;
        }

        return false;
      } catch (error) {
        console.error("Erro ao excluir tarefas:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Erro ao excluir tarefas",
        }));
        return false;
      }
    },
    [userId, loadTasks, currentFilter]
  );

  const markTasksAsCompleted = useCallback(
    async (taskIds: string[]): Promise<boolean> => {
      if (!userId) return false;

      try {
        setState((prev) => ({ ...prev, loading: true }));

        const updatedCount = await markTasksAsCompletedService(userId, taskIds);

        if (updatedCount > 0) {
          await loadTasks(currentFilter);
          setSelectedTasks([]);
          setIsMultiSelectMode(false);
          return true;
        }

        return false;
      } catch (error) {
        console.error("Erro ao marcar tarefas como concluídas:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Erro ao marcar tarefas como concluídas",
        }));
        return false;
      }
    },
    [userId, loadTasks, currentFilter]
  );

  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTasks((prev) => {
      if (prev.includes(taskId)) {
        const newSelection = prev.filter((id) => id !== taskId);
        if (newSelection.length === 0) {
          setIsMultiSelectMode(false);
        }
        return newSelection;
      } else {
        return [...prev, taskId];
      }
    });
  }, []);

  const startMultiSelect = useCallback((taskId: string) => {
    setIsMultiSelectMode(true);
    setSelectedTasks([taskId]);
  }, []);

  const selectAllTasks = useCallback(() => {
    const allTaskIds = state.tasks.map((task) => task.id);
    setSelectedTasks((prev) =>
      prev.length === state.tasks.length ? [] : allTaskIds
    );
  }, [state.tasks]);

  const applyFilter = useCallback(
    async (filter: TaskStatus) => {
      setCurrentFilter(filter);
      setSelectedTasks([]);
      setIsMultiSelectMode(false);
      await loadTasks(filter);
    },
    [loadTasks]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    if (userId) {
      loadTasks(currentFilter);
    }
  }, [userId, loadTasks, currentFilter]);

  return {
    ...state,
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

    hasSelectedTasks: selectedTasks.length > 0,
    selectedCount: selectedTasks.length,
    canMarkAsCompleted: selectedTasks.some((id) => {
      const task = state.tasks.find((t) => t.id === id);
      return task?.status === "pendente";
    }),
  };
}
