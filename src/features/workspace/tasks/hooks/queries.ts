import { useQuery } from "@tanstack/react-query";
import { tasksQueryOptions, projectTasksQueryOptions, taskQueryOptions } from "../queryOptions";
export const useTasks = () => { return useQuery(tasksQueryOptions()); };
export const useProjectTasks = (id: string) => { return useQuery(projectTasksQueryOptions(id)); };
export const useTask = (id: string) => { return useQuery(taskQueryOptions(id)); };
