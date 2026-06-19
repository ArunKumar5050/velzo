import { LayoutDashboard, Package, Plus, ShoppingCart, Zap, Users, ScanLine, Activity, Store, TestTube, BarChart3 } from 'lucide-react'

export const ROLES = {
  ADMIN: 'ADMIN',
  MEDICAL_STORE: 'MEDICAL_STORE',
  LABORATORY: 'LABORATORY'
}

export const PERMISSIONS = {
  // Common
  DASHBOARD: 'DASHBOARD',
  
  // Products
  VIEW_PRODUCTS: 'VIEW_PRODUCTS',
  MANAGE_PRODUCTS: 'MANAGE_PRODUCTS', // add, edit, delete
  UPDATE_STOCK: 'UPDATE_STOCK', // update stock and price only
  
  // Orders
  VIEW_ALL_ORDERS: 'VIEW_ALL_ORDERS',
  VIEW_STORE_ORDERS: 'VIEW_STORE_ORDERS',
  UPDATE_ORDER_STATUS: 'UPDATE_ORDER_STATUS',
  DELETE_ORDER: 'DELETE_ORDER',
  
  // Lab Appointments
  VIEW_ALL_LAB_APPOINTMENTS: 'VIEW_ALL_LAB_APPOINTMENTS',
  VIEW_LAB_APPOINTMENTS: 'VIEW_LAB_APPOINTMENTS',
  UPDATE_LAB_APPOINTMENT_STATUS: 'UPDATE_LAB_APPOINTMENT_STATUS',
  
  // Doctors
  MANAGE_DOCTORS: 'MANAGE_DOCTORS',
  
  // Diagnostic
  DIAGNOSTIC: 'DIAGNOSTIC',
  
  // Admin only
  BILL_SCANNER: 'BILL_SCANNER', // Allowing medical stores also based on requirement
  MANAGE_STORES: 'MANAGE_STORES',
  MANAGE_LABS: 'MANAGE_LABS',
  ANALYTICS: 'ANALYTICS',
}

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS), // Admin has all permissions
  [ROLES.MEDICAL_STORE]: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.UPDATE_STOCK,
    PERMISSIONS.VIEW_STORE_ORDERS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.BILL_SCANNER, // Mentioned in requirements
  ],
  [ROLES.LABORATORY]: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.VIEW_LAB_APPOINTMENTS,
    PERMISSIONS.UPDATE_LAB_APPOINTMENT_STATUS,
  ]
}

export const hasPermission = (role, permission) => {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export const getDefaultRoute = (role) => {
  switch (role) {
    case ROLES.ADMIN: return '/';
    case ROLES.MEDICAL_STORE: return '/';
    case ROLES.LABORATORY: return '/';
    default: return '/login';
  }
}

export const getSidebarLinks = (role) => {
  const allLinks = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: [ROLES.ADMIN, ROLES.MEDICAL_STORE, ROLES.LABORATORY] },
    
    // Admin & Medical Store
    { path: '/products', icon: Package, label: 'Products', roles: [ROLES.ADMIN, ROLES.MEDICAL_STORE] },
    { path: '/orders', icon: ShoppingCart, label: 'Orders', roles: [ROLES.ADMIN, ROLES.MEDICAL_STORE] },
    { path: '/bill-scanner', icon: ScanLine, label: 'Bill Scanner', roles: [ROLES.ADMIN, ROLES.MEDICAL_STORE] },
    
    // Admin & Laboratory
    { path: '/lab-appointments', icon: Activity, label: 'Lab Tests', roles: [ROLES.ADMIN, ROLES.LABORATORY] },
    
    // Admin Only
    { path: '/doctors', icon: Users, label: 'Doctors', roles: [ROLES.ADMIN] },
    { path: '/add-product', icon: Plus, label: 'Add Product', roles: [ROLES.ADMIN] },
    { path: '/diagnostic', icon: Zap, label: 'Diagnostic', color: 'orange', roles: [ROLES.ADMIN] },
    { 
      label: 'Partner Management', 
      icon: Store, 
      roles: [ROLES.ADMIN],
      subLinks: [
        { path: '/manage-stores', label: 'Medical Stores' },
        { path: '/manage-labs', label: 'Laboratories' }
      ]
    },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', roles: [ROLES.ADMIN] },
  ];

  return allLinks.filter(link => link.roles.includes(role));
}
