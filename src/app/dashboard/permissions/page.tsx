'use client';

import { useState, useEffect } from 'react';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import Modal from '@/components/ui/Modal';
import { Plus, Trash2, Edit2, Shield, Lock, Loader2, UserPlus, CheckCircle2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminManagementService, CreateAdminRequest } from '@/services/adminManagementService';
import { Admin, PermissionOption } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function PermissionsPage() {
    const { admin: currentAdmin } = useAuth();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [permissions, setPermissions] = useState<PermissionOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    
    const [formData, setFormData] = useState<CreateAdminRequest>({
        name: '',
        email: '',
        password: '',
        role: 'SUBADMIN',
        permissions: []
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [adminsRes, permsRes] = await Promise.all([
                adminManagementService.getAllAdmins(),
                adminManagementService.getAvailablePermissions()
            ]);
            
            if (adminsRes.success && adminsRes.data) {
                setAdmins(adminsRes.data);
            }
            if (permsRes.success && permsRes.data) {
                setPermissions(permsRes.data);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load admin data');
        } finally {
            setIsLoading(false);
        }
    };

    const columns: any[] = [
        { 
            header: 'Administrator', 
            accessor: (item: Admin) => (
                <div>
                    <div className="font-bold text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.email}</div>
                </div>
            )
        },
        { 
            header: 'Role', 
            accessor: (item: Admin) => (
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                    item.role === 'SUPERADMIN' 
                    ? 'bg-purple-50 text-purple-700 border-purple-100' 
                    : 'bg-blue-50 text-blue-700 border-blue-100'
                }`}>
                    {item.role}
                </span>
            )
        },
        {
            header: 'Permissions', 
            accessor: (item: Admin) => (
                item.role === 'SUPERADMIN' ? (
                    <span className="text-xs text-gray-400 italic">Full System Access</span>
                ) : (
                    <div className="flex flex-wrap gap-1 max-w-xs">
                        {item.permissions?.map((perm: string) => (
                            <span key={perm} className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded text-[10px] font-semibold border border-gray-100">
                                {perm}
                            </span>
                        )) || <span className="text-xs text-red-400">No permissions</span>}
                    </div>
                )
            )
        },
        {
            header: 'Actions', 
            accessor: (item: Admin) => (
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleEditClick(item)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Admin"
                    >
                        <Edit2 size={16} />
                    </button>
                    {item.id !== currentAdmin?.id && item.role !== 'SUPERADMIN' && (
                        <button
                            onClick={() => handleDeleteAdmin(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Admin"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            )
        },
    ];

    const handleEditClick = (admin: Admin) => {
        setEditingAdmin(admin);
        setFormData({
            name: admin.name,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions || []
        });
        setIsModalOpen(true);
    };

    const handleCreateClick = () => {
        setEditingAdmin(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'SUBADMIN',
            permissions: []
        });
        setIsModalOpen(true);
    };

    const togglePermission = (perm: string) => {
        const newPermissions = formData.permissions.includes(perm)
            ? formData.permissions.filter(p => p !== perm)
            : [...formData.permissions, perm];
        setFormData({ ...formData, permissions: newPermissions });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let response;
            if (editingAdmin) {
                // Remove password from update if empty
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                
                response = await adminManagementService.updateAdmin(editingAdmin.id, updateData);
            } else {
                if (!formData.password) {
                    toast.error('Password is required for new admins');
                    setIsSubmitting(false);
                    return;
                }
                response = await adminManagementService.createAdmin(formData);
            }

            if (response.success) {
                toast.success(editingAdmin ? 'Admin updated successfully' : 'Admin created successfully');
                setIsModalOpen(false);
                loadData();
            } else {
                toast.error(response.message || 'Operation failed');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAdmin = async (id: string) => {
        if (!confirm('Are you sure you want to remove this administrator?')) return;
        try {
            const response = await adminManagementService.deleteAdmin(id);
            if (response.success) {
                toast.success('Administrator removed');
                loadData();
            } else {
                toast.error(response.message || 'Failed to delete');
            }
        } catch (error) {
            toast.error('Failed to delete administrator');
        }
    };

    return (
        <div className="animate-fade-in space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admins & Permissions</h1>
                    <p className="text-sm text-gray-500">Manage administrator accounts and their granular access levels.</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                >
                    <UserPlus className="w-4 h-4" />
                    Add Administrator
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    Admin Users
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                </h2>
                <AdvancedTable
                    data={admins}
                    columns={columns}
                    itemsPerPage={10}
                    searchPlaceholder="Search by name or email..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6 bg-blue-50 border-blue-100">
                    <div className="flex gap-4">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600 h-fit">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1">Access Control Policy</h3>
                            <p className="text-sm text-gray-600">
                                <b>SUPERADMIN</b>: Full system access. Cannot be restricted.<br />
                                <b>SUBADMIN</b> (including CC Team): Access is restricted based on the permissions selected below.
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="card p-6 bg-green-50 border-green-100">
                    <div className="flex gap-4">
                        <div className="p-3 bg-green-100 rounded-full text-green-600 h-fit">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1">Audit Trail Active</h3>
                            <p className="text-sm text-gray-600">
                                All changes to administrative accounts and permissions are recorded in the system audit logs for accountability.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={editingAdmin ? 'Edit Administrator' : 'Add New Administrator'}
                size="xl"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. John Doe"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {editingAdmin ? 'Password (Leave blank to keep current)' : 'Password'}
                            </label>
                            <input
                                required={!editingAdmin}
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">System Role</label>
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                            >
                                <option value="SUBADMIN">SUBADMIN (Permission Restricted)</option>
                                <option value="SUPERADMIN">SUPERADMIN (Full Access)</option>
                            </select>
                        </div>
                    </div>

                    {formData.role === 'SUBADMIN' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-3 border-b pb-2">Assign Permissions</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {permissions.map(perm => {
                                    const isChecked = formData.permissions.includes(perm.code);
                                    return (
                                        <button
                                            key={perm.code}
                                            type="button"
                                            onClick={() => togglePermission(perm.code)}
                                            className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                                                isChecked 
                                                ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-500/10' 
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                        >
                                            <span className="text-xs font-bold uppercase tracking-tight">{perm.label}</span>
                                            {isChecked && <CheckCircle2 size={16} className="text-red-500" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editingAdmin ? 'Update Administrator' : 'Create Administrator'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
