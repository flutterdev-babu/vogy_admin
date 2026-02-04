'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Search } from 'lucide-react';
import { userService } from '@/services/userService';
import { User } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
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

    fetchUsers();
  }, []);

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

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-500 mt-1">Manage platform users</p>
        </div>
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
                    <Link
                      href={`/dashboard/users/${user.id}`}
                      className="p-2 hover:bg-orange-50 rounded-lg text-orange-500 inline-flex"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
