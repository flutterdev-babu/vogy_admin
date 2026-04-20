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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Riders & Users</h1>
          <p className="text-sm text-gray-500 font-medium">Platform user directory and account management</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
            <div className="px-4 py-2 flex flex-col items-center">
              <span className="text-xl font-black text-gray-900 leading-none">{users.length}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Total Registered</span>
            </div>
          </div>

          <Link
            href="/dashboard/users/create"
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-xs shadow-lg shadow-gray-200 transition-all hover:bg-black hover:-translate-y-0.5 active:scale-95"
          >
            <UserPlus size={16} />
            <span>ADD NEW USER</span>
          </Link>
        </div>
      </div>

      {/* Modern Filter Section */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <div className="max-w-xl relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone (+91...), or email..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-400 font-medium"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">User Profile</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Contact Info</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono text-center">Auth Code</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Registration</th>
                <th className="px-4 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-gray-200" />
                      <p className="text-gray-400 font-bold italic">{searchTerm ? 'No matching users found' : 'No users registered yet'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group transition-all duration-200 hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-black text-xs group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-black text-gray-900 tracking-tight">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-gray-700 tracking-tight">{user.phone}</span>
                        <span className="text-[10px] font-bold text-gray-400">{user.email || 'No email associated'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex px-2 py-1 bg-gray-50 text-gray-600 rounded-lg border border-gray-100 font-mono text-[11px] font-black group-hover:bg-white transition-colors">
                        {user.uniqueOtp || '----'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-gray-700 tracking-tight">
                          {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                          {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right pr-8">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2">
                        <Link
                          href={`/dashboard/users/${user.id}`}
                          className="p-2.5 bg-white hover:bg-gray-900 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-100 shadow-sm"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2.5 bg-white hover:bg-gray-900 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-100 shadow-sm"
                          title="Edit Profile"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/30">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            End of Directory • <span className="text-gray-900 font-black">{filteredUsers.length}</span> Active Profiles
          </span>
        </div>
      </div>

      {/* Modern Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={closeEditModal} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-8 pb-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Edit Profile</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Updating ID: {editingUser.id.slice(-8)}</p>
                </div>
                <button onClick={closeEditModal} className="p-2 hover:bg-gray-100 rounded-2xl transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Full Identity</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Mobile Interface</label>
                  <div className="flex bg-gray-50 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-gray-200 transition-all">
                    <span className="px-4 py-4 text-xs font-black text-gray-400 bg-gray-100/50">+91</span>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, '');
                        if (v.length > 10 && v.startsWith('91')) v = v.slice(2);
                        setEditForm({ ...editForm, phone: v.slice(0, 10) });
                      }}
                      className="w-full px-2 py-4 bg-transparent border-none text-sm font-bold text-gray-900 outline-none"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Digital Mail</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                    placeholder="user@ara-travels.com"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 pt-6 flex gap-3">
              <button
                onClick={closeEditModal}
                className="flex-1 py-4 rounded-2xl text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-[2] py-4 rounded-2xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : 'COMMIT CHANGES'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
