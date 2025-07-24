// src/store/admin.ts

import { defineStore } from 'pinia';
import type { User } from '../mocks/admin/api';
import {
  loginMock,
  fetchUsersMock,
  saveUserMock,
  deleteUserMock
} from '../mocks/admin/api';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    currentUser: null as User | null,
    users: [] as User[],
    loading: false,
    error: '' as string
  }),

  getters: {
    isAuthenticated: (state) => !!state.currentUser,
    adminName: (state) => state.currentUser?.nombre || ''
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true;
      this.error = '';
      try {
        const user = await loginMock(email, password);
        this.currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (err: any) {
        this.error = err.message || 'Error al autenticar';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchUsers() {
      this.loading = true;
      this.error = '';
      try {
        this.users = await fetchUsersMock();
      } catch (err: any) {
        this.error = err.message || 'Error al obtener usuarios';
      } finally {
        this.loading = false;
      }
    },

    async saveUser(u: User) {
      this.loading = true;
      this.error = '';
      try {
        await saveUserMock(u);
        await this.fetchUsers();
      } catch (err: any) {
        this.error = err.message || 'Error al guardar usuario';
      } finally {
        this.loading = false;
      }
    },

    async deleteUser(id: number) {
      this.loading = true;
      this.error = '';
      try {
        await deleteUserMock(id);
        await this.fetchUsers();
      } catch (err: any) {
        this.error = err.message || 'Error al eliminar usuario';
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.currentUser = null;
      localStorage.removeItem('user');
    }
  }
});
