'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Search, Edit2, X, Loader2, UserPlus } from 'lucide-react';
import { userService } from '@/services/userService';
import { User, UpdateUserRequest } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data || []);
      setFilteredUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Client-side filtering
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      phone: user.phone?.replace('+91', '') || '',
      email: user.email || '',
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditForm({ name: '', phone: '', email: '' });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    if (editForm.phone.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return;
    }

    setIsSaving(true);
    try {
      const updateData: UpdateUserRequest = {};
      if (editForm.name !== editingUser.name) updateData.name = editForm.name;
      if (`+91${editForm.phone}` !== editingUser.phone) updateData.phone = `+91${editForm.phone}`;
      if (editForm.email !== editingUser.email) updateData.email = editForm.email;

      if (Object.keys(updateData).length === 0) {
        toast('No changes to save');
        closeEditModal();
        return;
      }

      const response = await userService.update(editingUser.id, updateData);
      if (response?.success) {
        toast.success('User updated successfully!');
        closeEditModal();
        await fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/30 transition-all bg-white";
  const labelClass = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-500 mt-1">Manage platform users</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="input pl-10 w-full sm:w-64"
            />
          </div>
          <Link
            href="/dashboard/users/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E32222] hover:bg-[#cc1f1f] text-white rounded-xl font-semibold text-sm shadow-lg shadow-red-500/20 transition-all whitespace-nowrap"
          >
            <UserPlus size={18} />
            <span>Add User</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="card p-6 mb-6 bg-gradient-to-r from-pink-500 to-pink-600">
        <p className="text-pink-100">Total Registered Users</p>
        <p className="text-4xl font-bold text-white">{users.length}</p>
      </div>

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">
            {searchTerm ? 'No users match your search' : 'No users found'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>OTP</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="font-semibold text-gray-800">{user.name}</td>
                  <td className="text-gray-600">{user.phone}</td>
                  <td className="text-gray-600">{user.email || '-'}</td>
                  <td>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                      {user.uniqueOtp}
                    </span>
                  </td>
                  <td className="text-gray-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/users/${user.id}`}
                        className="p-2 hover:bg-orange-50 rounded-lg text-orange-500 inline-flex"
                      >
                        <Eye size={18} />
                      </Link>
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-500 inline-flex"
                        title="Edit User"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeEditModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6 mx-4 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Edit User</h2>
              <button onClick={closeEditModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={inputClass}
                  placeholder="User Name"
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-medium">+91</span>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '');
                      if (v.length > 10 && v.startsWith('91')) v = v.slice(2);
                      setEditForm({ ...editForm, phone: v.slice(0, 10) });
                    }}
                    className="w-full border border-gray-200 rounded-r-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/30 transition-all"
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className={inputClass}
                  placeholder="user@example.com"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeEditModal}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-[#E32222] hover:bg-[#cc1f1f] text-white font-semibold text-sm shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
