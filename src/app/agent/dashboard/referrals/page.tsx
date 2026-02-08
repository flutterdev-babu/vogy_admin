'use client';

import { useState, useEffect } from 'react';
import { USER_KEYS } from '@/lib/api';
import { DollarSign, Gift, TrendingUp, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReferralsPage() {
  const [agent, setAgent] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEYS.agent);
    if (stored) {
      setAgent(JSON.parse(stored));
    }
  }, []);

  const referralSteps = [
    { title: 'Share Your Code', desc: 'Share your unique referral code with potential customers.', icon: Users },
    { title: 'Customer Books', desc: 'Customer enters your code during booking to get a discount.', icon: ArrowRight },
    { title: 'Earn Rewards', desc: 'You earn a commission for every successful ride they take.', icon: DollarSign },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Gift className="text-purple-600" />
            Referral Rewards
          </h1>
          <p className="text-gray-500 text-sm">Grow our community and earn rewards for every referral.</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1 rounded-2xl">
          <div className="bg-white px-6 py-3 rounded-[14px] text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Your Unique Code</p>
            <p className="text-2xl font-mono font-bold text-purple-600 tracking-wider">
              {agent?.agentCode || 'LOADING...'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RewardStatCard 
          title="Total Earnings" 
          value="₹12,450.00" 
          icon={<DollarSign size={24} className="text-green-500" />}
          bg="bg-green-50"
        />
        <RewardStatCard 
          title="Pending Rewards" 
          value="₹1,200.00" 
          icon={<TrendingUp size={24} className="text-blue-500" />}
          bg="bg-blue-50"
        />
        <RewardStatCard 
          title="Total Referrals" 
          value="128" 
          icon={<Users size={24} className="text-purple-500" />}
          bg="bg-purple-50"
        />
      </div>

      {/* How it works */}
      <div className="card p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-8 border-b border-gray-100 pb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {referralSteps.map((step, idx) => (
            <div key={idx} className="relative z-10 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-purple-500/20">
                <step.icon size={28} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{step.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
              </div>
            </div>
          ))}
          {/* Connector Line (visible on md+) */}
          <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 -z-0" />
        </div>
      </div>

      {/* Recent Success Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Recent Conversions</h2>
          <button className="text-purple-600 font-semibold text-sm hover:underline">Download Report</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Booking Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <ReferralRow name="Rahul Sharma" date="8 Feb 2026" status="COMPLETED" reward="₹45.00" />
              <ReferralRow name="Priya Singh" date="7 Feb 2026" status="COMPLETED" reward="₹32.00" />
              <ReferralRow name="Amit Kumar" date="7 Feb 2026" status="PENDING" reward="₹50.00" />
              <ReferralRow name="Sneha Reddy" date="6 Feb 2026" status="COMPLETED" reward="₹28.00" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RewardStatCard({ title, value, icon, bg }: { title: string, value: string, icon: React.ReactNode, bg: string }) {
  return (
    <div className={`p-6 rounded-2xl border border-gray-100 shadow-sm ${bg} hover:shadow-md transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white rounded-xl shadow-sm">
          {icon}
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ReferralRow({ name, date, status, reward }: { name: string, date: string, status: string, reward: string }) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4 font-medium text-gray-800">{name}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{date}</td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest ${
          status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
        }`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 font-bold text-gray-800">{reward}</td>
    </tr>
  );
}
