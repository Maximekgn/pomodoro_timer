import axios from 'axios';
import { API_URL } from './config';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const getTasks = () => api.get('/api/tasks');
export const createTask = (title: string) => api.post('/api/tasks', { title });
export const updateTask = (id: number, completed: boolean) => api.put(`/api/tasks/${id}`, { completed });
export const deleteTask = (id: number) => api.delete(`/api/tasks/${id}`);

export default api; 