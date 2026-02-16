'use client';

import { useState, useEffect } from 'react';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import Modal from '@/components/ui/Modal';
import { Plus, Trash2, Edit2, Shield, Lock, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { permissionService, Role } from '@/services/permissionService';

export default function PermissionsPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRole, setNewRole] = useState({ name: '', permissions: '' });

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setIsLoading(true);
        try {
            const response = await permissionService.getAllRoles();
            if (response.success && response.data) {
                setRoles(response.data);
            }
        } catch (error) {
            console.error('Failed to load roles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const columns: any[] = [
        { header: 'Role Name', accessor: (item: any) => <span className="font-bold text-gray-900">{item.name}</span> },
        {
            header: 'Permissions', accessor: (item: any) => (
                <div className="flex flex-wrap gap-1">
                    {item.permissions.map((perm: string) => (
                        <span key={perm} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">
                            {perm}
                        </span>
                    ))}
                </div>
            )
        },
        { header: 'Active Users', accessor: 'userCount' },
        {
            header: 'Actions', accessor: (item: any) => (
                <div className="flex gap-2">
                    <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors tooltip" title="Edit Permissions">
                        <Edit2 size={16} />
                    </button>
                    {!item.isSystem && (
                        <button
                            onClick={() => handleDeleteRole(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Role"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            )
        },
    ];

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const permissionsArray = newRole.permissions.split(',').map(p => p.trim()).filter(Boolean);
            const response = await permissionService.createRole({
                name: newRole.name,
                permissions: permissionsArray
            });

            if (response.success) {
                toast.success('Role created successfully');
                setIsModalOpen(false);
                setNewRole({ name: '', permissions: '' });
                loadRoles();
            } else {
                toast.error(response.message || 'Failed to create role');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRole = async (id: string) => {
        if (!confirm('Are you sure you want to delete this role?')) return;
        try {
            const response = await permissionService.deleteRole(id);
            if (response.success) {
                toast.success('Role deleted');
                loadRoles();
            }
        } catch (error) {
            toast.error('Failed to delete role');
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Permission Management</h1>
                    <p className="text-sm text-gray-500">Configure access levels and roles for system administrators.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                >
                    <Plus className="w-4 h-4" />
                    Create New Role
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    System Roles
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                </h2>
                <AdvancedTable
                    data={roles}
                    columns={columns}
                    itemsPerPage={10}
                />
            </div>

            <div className="card p-6 bg-blue-50 border-blue-100 mt-6">
                <div className="flex gap-4">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600 h-fit">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 mb-1">Access Control Policy</h3>
                        <p className="text-sm text-gray-600">
                            Roles define what actions admins can perform. <br />
                            • <b>Super Admin</b>: Full system access. Cannot be deleted.<br />
                            • <b>Support Agent</b>: Access to user data and support tickets only.<br />
                            • <b>Finance Manager</b>: Access to payments, payouts, and revenue reports.
                        </p>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Role">
                <form onSubmit={handleCreateRole} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                        <input
                            required
                            type="text"
                            value={newRole.name}
                            onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                            placeholder="e.g. Audit Manager"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Permissions (Comma separated)</label>
                        <textarea
                            required
                            value={newRole.permissions}
                            onChange={e => setNewRole({ ...newRole, permissions: e.target.value })}
                            placeholder="VIEW_LOGS, EXPORT_DATA"
                            rows={3}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Role'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
