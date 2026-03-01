'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { corporateService } from '@/services/corporateService';
import { agentService } from '@/services/agentService';
import { CorporateRegisterRequest, CityCode } from '@/types';

export default function AdminCreateCorporatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cityCodes, setCityCodes] = useState<CityCode[]>([]);

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    password: '',
    cityCodeId: '',

    // Basic & Location
    state: '',
    area: '',
    headOfficeAddress: '',
    branchOfficeAddress: '',
    
    // Tax & Legal
    panNumber: '',
    gstNumber: '',
    comments: '',

    // Owner Details
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    ownerAadhaar: '',
    ownerPan: '',

    // POCs
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactNumber: '',
    secondaryContactName: '',
    secondaryContactNumber: '',
    secondaryContactEmail: '',
    financeContactName: '',
    financeContactNumber: '',
    financeContactEmail: '',

    // Bank
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchAddress: '',
    upiLinkedNumber: '',
  });

  useEffect(() => {
    fetchCityCodes();
  }, []);

  const fetchCityCodes = async () => {
    try {
      const response = await agentService.getCityCodes();
      if (response.success && response.data) {
        setCityCodes(response.data);
      }
    } catch (error) {
      console.error('Failed to load city codes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return;
    }
    if (!formData.cityCodeId) {
      toast.error('Please select a city');
      return;
    }
    
    setIsLoading(true);
    try {
      const submitData: CorporateRegisterRequest = {
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        phone: `+91${formData.phone}`,
        email: formData.email,
        password: formData.password || undefined,
        cityCodeId: formData.cityCodeId,

        state: formData.state || undefined,
        area: formData.area || undefined,
        headOfficeAddress: formData.headOfficeAddress || undefined,
        branchOfficeAddress: formData.branchOfficeAddress || undefined,

        panNumber: formData.panNumber || undefined,
        gstNumber: formData.gstNumber || undefined,
        comments: formData.comments || undefined,

        ownerName: formData.ownerName || undefined,
        ownerPhone: formData.ownerPhone ? `+91${formData.ownerPhone}` : undefined,
        ownerEmail: formData.ownerEmail || undefined,
        ownerAadhaar: formData.ownerAadhaar || undefined,
        ownerPan: formData.ownerPan || undefined,

        primaryContactName: formData.primaryContactName || undefined,
        primaryContactEmail: formData.primaryContactEmail || undefined,
        primaryContactNumber: formData.primaryContactNumber ? `+91${formData.primaryContactNumber}` : undefined,
        secondaryContactName: formData.secondaryContactName || undefined,
        secondaryContactEmail: formData.secondaryContactEmail || undefined,
        secondaryContactNumber: formData.secondaryContactNumber ? `+91${formData.secondaryContactNumber}` : undefined,
        financeContactName: formData.financeContactName || undefined,
        financeContactEmail: formData.financeContactEmail || undefined,
        financeContactNumber: formData.financeContactNumber ? `+91${formData.financeContactNumber}` : undefined,

        accountHolderName: formData.accountHolderName || undefined,
        bankName: formData.bankName || undefined,
        accountNumber: formData.accountNumber || undefined,
        ifscCode: formData.ifscCode || undefined,
        branchAddress: formData.branchAddress || undefined,
        upiLinkedNumber: formData.upiLinkedNumber ? `+91${formData.upiLinkedNumber}` : undefined,
      };
      
      const response = await corporateService.createCorporateByAdmin(submitData);
      if (response.success) {
        toast.success('Corporate created successfully!');
        router.push('/dashboard/corporates');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create corporate');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/30 transition-all bg-white";
  const labelClass = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block";

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link href="/dashboard/corporates" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 group text-sm">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Corporates
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Create New Corporate</h1>
        <p className="text-sm text-gray-500 mt-1">Register a new corporate account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-[#E32222] uppercase tracking-wide mb-2 flex items-center gap-2">
            <Building2 size={16} /> Corporate Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Company Name *</label>
              <input type="text" required value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
                className={inputClass} placeholder="Company Name" />
            </div>
            <div>
              <label className={labelClass}>Contact Person *</label>
              <input type="text" required value={formData.contactPerson}
                onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                className={inputClass} placeholder="Contact Person Name" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone *</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-medium">+91</span>
                <input type="tel" required value={formData.phone}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, '');
                    if (v.length > 10 && v.startsWith('91')) v = v.slice(2);
                    setFormData({...formData, phone: v.slice(0, 10)});
                  }}
                  className="w-full border border-gray-200 rounded-r-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/30 transition-all"
                  placeholder="9876543210" maxLength={10} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" required value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className={inputClass} placeholder="corporate@example.com" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City *</label>
              <select required value={formData.cityCodeId}
                onChange={e => setFormData({...formData, cityCodeId: e.target.value})}
                className={inputClass}>
                <option value="">Select City</option>
                {cityCodes.map(city => (
                  <option key={city.id} value={city.id}>{city.cityName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>State *</label>
              <input type="text" required value={formData.state}
                onChange={e => setFormData({...formData, state: e.target.value})}
                className={inputClass} placeholder="State" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Area *</label>
              <input type="text" required value={formData.area}
                onChange={e => setFormData({...formData, area: e.target.value})}
                className={inputClass} placeholder="Area" />
            </div>
            <div>
              <label className={labelClass}>Head Office Address *</label>
              <input type="text" required value={formData.headOfficeAddress}
                onChange={e => setFormData({...formData, headOfficeAddress: e.target.value})}
                className={inputClass} placeholder="Head Office Address" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Branch Office Address (Optional)</label>
              <input type="text" value={formData.branchOfficeAddress}
                onChange={e => setFormData({...formData, branchOfficeAddress: e.target.value})}
                className={inputClass} placeholder="Branch Office Address" />
            </div>
            <div>
              <label className={labelClass}>PAN Number *</label>
              <input type="text" required value={formData.panNumber}
                onChange={e => setFormData({...formData, panNumber: e.target.value})}
                className={inputClass} placeholder="PAN Number" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>GST Number (Optional)</label>
              <input type="text" value={formData.gstNumber}
                onChange={e => setFormData({...formData, gstNumber: e.target.value})}
                className={inputClass} placeholder="GST Number" />
            </div>
            <div>
              <label className={labelClass}>Comments (Optional)</label>
              <input type="text" value={formData.comments}
                onChange={e => setFormData({...formData, comments: e.target.value})}
                className={inputClass} placeholder="Comments" />
            </div>
          </div>

          <h3 className="text-sm font-bold text-[#E32222] uppercase tracking-wide mb-2 mt-6 flex items-center gap-2 border-t pt-4">
            Owner Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Owner Name *</label>
              <input type="text" required value={formData.ownerName}
                onChange={e => setFormData({...formData, ownerName: e.target.value})}
                className={inputClass} placeholder="Owner Name" />
            </div>
            <div>
              <label className={labelClass}>Owner Phone</label>
              <input type="tel" value={formData.ownerPhone}
                onChange={e => setFormData({...formData, ownerPhone: e.target.value.replace(/\D/g, '').slice(0,10)})}
                className={inputClass} placeholder="Owner Phone" maxLength={10} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Owner Email</label>
              <input type="email" value={formData.ownerEmail}
                onChange={e => setFormData({...formData, ownerEmail: e.target.value})}
                className={inputClass} placeholder="Owner Email" />
            </div>
            <div>
              <label className={labelClass}>Owner Aadhaar</label>
              <input type="text" value={formData.ownerAadhaar}
                onChange={e => setFormData({...formData, ownerAadhaar: e.target.value})}
                className={inputClass} placeholder="Owner Aadhaar" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Owner PAN</label>
              <input type="text" value={formData.ownerPan}
                onChange={e => setFormData({...formData, ownerPan: e.target.value})}
                className={inputClass} placeholder="Owner PAN" />
            </div>
          </div>

          <h3 className="text-sm font-bold text-[#E32222] uppercase tracking-wide mb-2 mt-6 flex items-center gap-2 border-t pt-4">
            Points of Contact
          </h3>

          {/* Primary & Secondary POC */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Primary POC Name</label>
              <input type="text" value={formData.primaryContactName}
                onChange={e => setFormData({...formData, primaryContactName: e.target.value})}
                className={inputClass} placeholder="Name" />
            </div>
            <div>
              <label className={labelClass}>Primary POC Phone</label>
              <input type="tel" value={formData.primaryContactNumber}
                onChange={e => setFormData({...formData, primaryContactNumber: e.target.value.replace(/\D/g, '').slice(0,10)})}
                className={inputClass} placeholder="Phone" maxLength={10} />
            </div>
            <div>
              <label className={labelClass}>Primary POC Email</label>
              <input type="email" value={formData.primaryContactEmail}
                onChange={e => setFormData({...formData, primaryContactEmail: e.target.value})}
                className={inputClass} placeholder="Email" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Secondary POC Name</label>
              <input type="text" value={formData.secondaryContactName}
                onChange={e => setFormData({...formData, secondaryContactName: e.target.value})}
                className={inputClass} placeholder="Name" />
            </div>
            <div>
              <label className={labelClass}>Secondary POC Phone</label>
              <input type="tel" value={formData.secondaryContactNumber}
                onChange={e => setFormData({...formData, secondaryContactNumber: e.target.value.replace(/\D/g, '').slice(0,10)})}
                className={inputClass} placeholder="Phone" maxLength={10} />
            </div>
            <div>
              <label className={labelClass}>Secondary POC Email</label>
              <input type="email" value={formData.secondaryContactEmail}
                onChange={e => setFormData({...formData, secondaryContactEmail: e.target.value})}
                className={inputClass} placeholder="Email" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Finance POC Name</label>
              <input type="text" value={formData.financeContactName}
                onChange={e => setFormData({...formData, financeContactName: e.target.value})}
                className={inputClass} placeholder="Name" />
            </div>
            <div>
              <label className={labelClass}>Finance POC Phone</label>
              <input type="tel" value={formData.financeContactNumber}
                onChange={e => setFormData({...formData, financeContactNumber: e.target.value.replace(/\D/g, '').slice(0,10)})}
                className={inputClass} placeholder="Phone" maxLength={10} />
            </div>
            <div>
              <label className={labelClass}>Finance POC Email</label>
              <input type="email" value={formData.financeContactEmail}
                onChange={e => setFormData({...formData, financeContactEmail: e.target.value})}
                className={inputClass} placeholder="Email" />
            </div>
          </div>

          <h3 className="text-sm font-bold text-[#E32222] uppercase tracking-wide mb-2 mt-6 flex items-center gap-2 border-t pt-4">
            Bank Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Account Holder Name</label>
              <input type="text" value={formData.accountHolderName}
                onChange={e => setFormData({...formData, accountHolderName: e.target.value})}
                className={inputClass} placeholder="Account Holder Name" />
            </div>
            <div>
              <label className={labelClass}>Bank Name</label>
              <input type="text" value={formData.bankName}
                onChange={e => setFormData({...formData, bankName: e.target.value})}
                className={inputClass} placeholder="Bank Name" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Account Number</label>
              <input type="text" value={formData.accountNumber}
                onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                className={inputClass} placeholder="Account Number" />
            </div>
            <div>
              <label className={labelClass}>IFSC Code</label>
              <input type="text" value={formData.ifscCode}
                onChange={e => setFormData({...formData, ifscCode: e.target.value})}
                className={inputClass} placeholder="IFSC Code" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Branch Address</label>
              <input type="text" value={formData.branchAddress}
                onChange={e => setFormData({...formData, branchAddress: e.target.value})}
                className={inputClass} placeholder="Branch Address" />
            </div>
            <div>
              <label className={labelClass}>UPI Linked Number</label>
              <input type="tel" value={formData.upiLinkedNumber}
                onChange={e => setFormData({...formData, upiLinkedNumber: e.target.value.replace(/\D/g, '').slice(0,10)})}
                className={inputClass} placeholder="UPI Linked Number" maxLength={10} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Password *</label>
            <input type="password" required value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className={inputClass} placeholder="Create a password" />
          </div>
        </div>

        <button type="submit" disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-[#E32222] hover:bg-[#cc1f1f] text-white font-semibold text-sm shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Building2 size={20} />}
          <span>{isLoading ? 'Creating Corporate...' : 'Create Corporate'}</span>
        </button>
      </form>
    </div>
  );
}
