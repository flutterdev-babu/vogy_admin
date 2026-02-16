'use client';

import { useState, useEffect } from 'react';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import { ExportButton } from '@/components/ui/ExportButton';
import { Plus, User, Trash2, Edit2, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';
import { corporateService } from '@/services/corporateService';

interface Employee {
    id: string;
    name: string;
    email: string;
    department: string;
    status: 'ACTIVE' | 'INACTIVE';
    spendingLimit: number;
}

export default function CorporateEmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState({ name: '', email: '', department: '', spendingLimit: 5000 });

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            const response = await corporateService.getEmployees();
            if (response.success && response.data) {
                setEmployees(response.data);
            }
        } catch (error) {
            console.error('Failed to load employees');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading('Adding employee...');
        try {
            const response = await corporateService.addEmployee(newEmployee);
            if (response.success) {
                toast.success('Employee added successfully', { id: toastId });
                setIsModalOpen(false);
                setNewEmployee({ name: '', email: '', department: '', spendingLimit: 5000 });
                loadEmployees();
            } else {
                toast.error(response.message || 'Failed to add employee', { id: toastId });
            }
        } catch (error) {
            toast.error('Error adding employee', { id: toastId });
        }
    };

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm('Are you sure you want to remove this employee?')) return;
        const toastId = toast.loading('Removing employee...');
        try {
            const response = await corporateService.deleteEmployee(id);
            // Assuming void response or check success
            toast.success('Employee removed', { id: toastId });
            loadEmployees();
        } catch (error) {
            toast.error('Failed to remove employee', { id: toastId });
        }
    };

    const columns: any[] = [
        { header: 'ID', accessor: 'id' },
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Department', accessor: (item: any) => <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium">{item.department}</span> },
        { header: 'Monthly Limit', accessor: (item: any) => <span className="font-bold text-gray-700">₹{item.spendingLimit}</span> },
        {
            header: 'Status', accessor: (item: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.status}
                </span>
            )
        },
        {
            header: 'Actions', accessor: (item: any) => (
                <div className="flex gap-2">
                    <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDeleteEmployee(item.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        },
    ];

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-400" /></div>;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
                    <p className="text-sm text-gray-500">Manage user access and spending limits.</p>
                </div>
                <div className="flex gap-3">
                    <ExportButton data={employees} filename="employees" />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                    >
                        <Plus className="w-4 h-4" />
                        Add Employee
                    </button>
                </div>
            </div>

            <AdvancedTable
                data={employees}
                columns={columns}
                searchable={true}
                searchKeys={['name', 'email', 'department']}
                itemsPerPage={10}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Employee">
                <form onSubmit={handleAddEmployee} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            required
                            type="text"
                            value={newEmployee.name}
                            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            placeholder="e.g. John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            required
                            type="email"
                            value={newEmployee.email}
                            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            placeholder="john@company.com"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select
                                required
                                value={newEmployee.department}
                                onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            >
                                <option value="">Select Dept</option>
                                <option value="Sales">Sales</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Engineering">Engineering</option>
                                <option value="HR">HR</option>
                                <option value="Operations">Operations</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit (₹)</label>
                            <input
                                required
                                type="number"
                                value={newEmployee.spendingLimit}
                                onChange={(e) => setNewEmployee({ ...newEmployee, spendingLimit: Number(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                        >
                            Add Employee
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
