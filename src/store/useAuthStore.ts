import { create } from 'zustand';
import type { User, UserRole } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthState {
  currentUser: User;
  allUsers: User[];
  setCurrentUser: (userId: string) => void;
  getUserById: (id: string) => User | undefined;
  getRoleLabel: (role: UserRole) => string;
}

const roleLabels: Record<UserRole, string> = {
  author: '主笔/作者',
  editor: '责任编辑',
  art_supervisor: '美术监修',
  text_editor: '文字编辑',
};

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: mockUsers[1],
  allUsers: mockUsers,
  setCurrentUser: (userId) => {
    const user = mockUsers.find((u) => u.id === userId);
    if (user) set({ currentUser: user });
  },
  getUserById: (id) => get().allUsers.find((u) => u.id === id),
  getRoleLabel: (role) => roleLabels[role],
}));
