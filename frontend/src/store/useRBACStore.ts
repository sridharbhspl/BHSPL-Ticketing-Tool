import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RolePermissions {
  modules: {
    dashboard: boolean;
    tickets: boolean;
    board: boolean;
    projects: boolean;
    team: boolean;
    chat: boolean;
    settings: boolean;
  };
  actions: {
    create_ticket: boolean;
    edit_ticket: boolean;
    delete_ticket: boolean;
    view_ticket: boolean;
    add_member: boolean;
    simulate_clearance: boolean;
  };
}

interface RBACState {
  permissions: Record<string, RolePermissions>;
  hasModuleAccess: (role: string, moduleId: string) => boolean;
  hasActionAccess: (role: string, actionId: string) => boolean;
  updateModuleAccess: (role: string, moduleId: string, allowed: boolean) => void;
  updateActionAccess: (role: string, actionId: string, allowed: boolean) => void;
  resetToDefaults: () => void;
}

const defaultPermissions: Record<string, RolePermissions> = {
  Admin: {
    modules: {
      dashboard: true,
      tickets: true,
      board: true,
      projects: true,
      team: true,
      chat: true,
      settings: true,
    },
    actions: {
      create_ticket: true,
      edit_ticket: true,
      delete_ticket: true,
      view_ticket: true,
      add_member: true,
      simulate_clearance: true,
    },
  },
  'Project Manager': {
    modules: {
      dashboard: true,
      tickets: true,
      board: true,
      projects: true,
      team: true,
      chat: true,
      settings: true,
    },
    actions: {
      create_ticket: true,
      edit_ticket: true,
      delete_ticket: true,
      view_ticket: true,
      add_member: true,
      simulate_clearance: true,
    },
  },
  'Senior Developer': {
    modules: {
      dashboard: true,
      tickets: true,
      board: true,
      projects: true,
      team: true,
      chat: true,
      settings: true,
    },
    actions: {
      create_ticket: true,
      edit_ticket: true,
      delete_ticket: false,
      view_ticket: true,
      add_member: true,
      simulate_clearance: true,
    },
  },
  'Fullstack Developer': {
    modules: {
      dashboard: true,
      tickets: true,
      board: true,
      projects: true,
      team: true,
      chat: true,
      settings: true,
    },
    actions: {
      create_ticket: true,
      edit_ticket: true,
      delete_ticket: false,
      view_ticket: true,
      add_member: true,
      simulate_clearance: true,
    },
  },
  Developer: {
    modules: {
      dashboard: false,
      tickets: true,
      board: true,
      projects: true,
      team: true,
      chat: true,
      settings: false,
    },
    actions: {
      create_ticket: true,
      edit_ticket: true,
      delete_ticket: false,
      view_ticket: true,
      add_member: false,
      simulate_clearance: true,
    },
  },
  'QA Tester': {
    modules: {
      dashboard: false,
      tickets: true,
      board: true,
      projects: true,
      team: true,
      chat: true,
      settings: false,
    },
    actions: {
      create_ticket: true,
      edit_ticket: true,
      delete_ticket: false,
      view_ticket: true,
      add_member: false,
      simulate_clearance: true,
    },
  },
  Client: {
    modules: {
      dashboard: false,
      tickets: true,
      board: true,
      projects: true,
      team: true,
      chat: true,
      settings: false,
    },
    actions: {
      create_ticket: false,
      edit_ticket: false,
      delete_ticket: false,
      view_ticket: true,
      add_member: false,
      simulate_clearance: true,
    },
  },
  Viewer: {
    modules: {
      dashboard: true,
      tickets: true,
      board: true,
      projects: true,
      team: true,
      chat: true,
      settings: false,
    },
    actions: {
      create_ticket: false,
      edit_ticket: false,
      delete_ticket: false,
      view_ticket: true,
      add_member: false,
      simulate_clearance: true,
    },
  },
};

const fallbackPermissions: RolePermissions = {
  modules: {
    dashboard: false,
    tickets: true,
    board: true,
    projects: true,
    team: true,
    chat: true,
    settings: false,
  },
  actions: {
    create_ticket: true,
    edit_ticket: true,
    delete_ticket: false,
    view_ticket: true,
    add_member: false,
    simulate_clearance: true,
  },
};

export const useRBACStore = create<RBACState>()(
  persist(
    (set, get) => ({
      permissions: defaultPermissions,

      hasModuleAccess: (role, moduleId) => {
        if (!role) return false;
        const roles = role.split(',');
        return roles.some((r) => {
          const rolePerms = get().permissions[r.trim()] || fallbackPermissions;
          return rolePerms.modules[moduleId as keyof RolePermissions['modules']] ?? false;
        });
      },

      hasActionAccess: (role, actionId) => {
        if (!role) return false;
        const roles = role.split(',');
        return roles.some((r) => {
          const rolePerms = get().permissions[r.trim()] || fallbackPermissions;
          return rolePerms.actions[actionId as keyof RolePermissions['actions']] ?? false;
        });
      },

      updateModuleAccess: (role, moduleId, allowed) => {
        set((state) => {
          const currentRolePerms = state.permissions[role] || { ...fallbackPermissions };
          const updatedRolePerms = {
            ...currentRolePerms,
            modules: {
              ...currentRolePerms.modules,
              [moduleId]: allowed,
            },
          };
          return {
            permissions: {
              ...state.permissions,
              [role]: updatedRolePerms,
            },
          };
        });
      },

      updateActionAccess: (role, actionId, allowed) => {
        set((state) => {
          const currentRolePerms = state.permissions[role] || { ...fallbackPermissions };
          const updatedRolePerms = {
            ...currentRolePerms,
            actions: {
              ...currentRolePerms.actions,
              [actionId]: allowed,
            },
          };
          return {
            permissions: {
              ...state.permissions,
              [role]: updatedRolePerms,
            },
          };
        });
      },

      resetToDefaults: () => {
        set({ permissions: defaultPermissions });
      },
    }),
    {
      name: 'rbac-storage',
    }
  )
);
