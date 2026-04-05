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
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${item.role === 'SUPERADMIN'
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
        <div className="space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Access Control
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Manage administrator privileges and system security</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-xs shadow-lg shadow-gray-200 transition-all hover:bg-black hover:-translate-y-0.5 active:scale-95"
                >
                    <UserPlus size={16} />
                    <span>AUTHORIZE NEW ADMIN</span>
                </button>
            </div>

            {/* Main Admin Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-2">
                <div className="px-8 py-5 flex items-center justify-between border-b border-gray-50 mb-2">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Administrators</h3>
                    {isLoading && <Loader2 size={16} className="animate-spin text-gray-400" />}
                </div>
                <AdvancedTable
                    data={admins}
                    columns={[
                        {
                            header: 'IDENTITY',
                            accessor: (item: Admin) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 font-black text-xs">
                                        {item.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-gray-900 tracking-tight">{item.name}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.email}</div>
                                    </div>
                                </div>
                            )
                        },
                        {
                            header: 'DESIGNATION',
                            accessor: (item: Admin) => (
                                <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${item.role === 'SUPERADMIN'
                                        ? 'bg-purple-50 text-purple-700 border-purple-100'
                                        : 'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                    {item.role}
                                </span>
                            )
                        },
                        {
                            header: 'PRIVILEGES',
                            accessor: (item: Admin) => (
                                item.role === 'SUPERADMIN' ? (
                                    <div className="flex items-center gap-2 text-indigo-500">
                                        <Shield size={12} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Unrestricted Access</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                                        {item.permissions?.slice(0, 3).map((perm: string) => (
                                            <span key={perm} className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md text-[9px] font-black border border-gray-100 uppercase">
                                                {perm.split('_').join(' ')}
                                            </span>
                                        )) || <span className="text-[9px] font-bold text-red-400 uppercase">No Access</span>}
                                        {(item.permissions?.length || 0) > 3 && (
                                            <span className="text-[9px] font-black text-gray-300 uppercase">+{item.permissions!.length - 3} MORE</span>
                                        )}
                                    </div>
                                )
                            )
                        },
                        {
                            header: 'COMMAND',
                            accessor: (item: Admin) => (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEditClick(item)}
                                        className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                                        title="Edit Privileges"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    {item.id !== currentAdmin?.id && item.role !== 'SUPERADMIN' && (
                                        <button
                                            onClick={() => handleDeleteAdmin(item.id)}
                                            className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Revoke Access"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            )
                        },
                    ]}
                    itemsPerPage={10}
                    searchPlaceholder="Filter by identity..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white space-y-6 shadow-2xl shadow-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center text-indigo-400">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest">Security Protocol</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">Access Control Architecture</p>
                        </div>
                    </div>
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                            <p className="text-[11px] text-gray-300 font-medium uppercase font-mono"><b>SUPERADMIN</b>: Root access, non-restrictable.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                            <p className="text-[11px] text-gray-400 font-medium uppercase font-mono"><b>SUBADMIN</b>: Granular endpoint restrictions apply.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 space-y-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Audit Compliance</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">Real-time Accountability</p>
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed uppercase">
                        All administrative mutations and privilege shifts are logged with origin IP and timestamp for forensic audit.
                    </p>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingAdmin ? 'Adjust Privileges' : 'Authorize Admin'}
                size="xl"
            >
                <form onSubmit={handleSubmit} className="space-y-10 p-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Identity Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. John Doe"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                                />
                            </div>
                            <div className="group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Secure Email</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@vogy.com"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">
                                    {editingAdmin ? 'Credential Refresh (Optional)' : 'Security Credential'}
                                </label>
                                <input
                                    required={!editingAdmin}
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                                />
                            </div>
                            <div className="group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">System Tier</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all appearance-none"
                                >
                                    <option value="SUBADMIN">SUBADMIN (Restricted)</option>
                                    <option value="SUPERADMIN">SUPERADMIN (Full Root)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {formData.role === 'SUBADMIN' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">Whitelist Permissions</h4>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {permissions.map(perm => {
                                    const isChecked = formData.permissions.includes(perm.code);
                                    return (
                                        <button
                                            key={perm.code}
                                            type="button"
                                            onClick={() => togglePermission(perm.code)}
                                            className={`p-4 rounded-2xl border text-left transition-all ${isChecked
                                                    ? 'bg-gray-900 border-gray-900 text-white shadow-xl shadow-gray-200'
                                                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-tighter leading-tight">{perm.label}</span>
                                                {isChecked && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-10 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-8 py-4 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-black transition-all flex items-center gap-3"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                            <span>{editingAdmin ? 'COMMIT UPDATES' : 'FINALIZE AUTHORIZATION'}</span>
                        </button>
                    </div>
                </form>
            </Modal>
        </div>

    );
}
