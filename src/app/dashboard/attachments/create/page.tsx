'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Save, Info, Loader2, User, Car, 
  Building2, ClipboardPaste, MapPin, FileUp, 
  Layers, Database, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import { attachmentService } from '@/services/attachmentService';
import { cityCodeService } from '@/services/cityCodeService';
import { CityCode } from '@/types';

type AttachmentFlow = 'BUNDLE' | 'INDIVIDUAL';

export default function CreateAttachmentPage() {
  const router = useRouter();
  const [activeFlow, setActiveFlow] = useState<AttachmentFlow>('BUNDLE');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [cities, setCities] = useState<CityCode[]>([]);

  // Flow A: Bundle Data
  const [bundleData, setBundleData] = useState({
    partnerCustomId: '',
    vehicleCustomId: '',
    vendorCustomId: '',
    cityCode: '',
    notes: ''
  });

  // Flow B: Individual Data
  const [individualData, setIndividualData] = useState({
    referenceType: 'PARTNER',
    referenceId: '', // Custom ID or Mongo ID (Service handles)
    fileType: 'DRIVING_LICENSE',
    fileUrl: '',
    uploadedBy: 'ADMIN'
  });

  useEffect(() => {
    const loadCities = async () => {
      try {
        const res = await cityCodeService.getAll();
        if (res.success) {
          setCities(res.data || []);
          if (res.data && res.data.length > 0) {
            setBundleData(prev => ({ ...prev, cityCode: res.data![0].code }));
          }
        }
      } catch (err) {
        console.error('Failed to load cities:', err);
      } finally {
        setIsDataLoading(false);
      }
    };
    loadCities();
  }, []);

  const handleBundleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bundleData.partnerCustomId || !bundleData.vehicleCustomId || !bundleData.vendorCustomId || !bundleData.cityCode) {
      toast.error('Please provide all required Custom IDs and City Code');
      return;
    }

    setIsLoading(true);
    try {
      const res = await attachmentService.create(bundleData as any);
      if (res.success) {
        toast.success('Registration Bundle Linked Successfully!');
        router.push('/dashboard/attachments');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to establish link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!individualData.referenceId || !individualData.fileUrl) {
      toast.error('Please provide Reference ID and File URL');
      return;
    }

    setIsLoading(true);
    try {
      const res = await attachmentService.create(individualData as any);
      if (res.success) {
        toast.success('Individual Document Uploaded Successfully!');
        router.push('/dashboard/attachments');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#E32222] focus:ring-4 focus:ring-[#E32222]/5 transition-all bg-gray-50/30";
  const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1";

  if (isDataLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Loader2 size={32} className="text-[#E32222] animate-spin" />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Warming Engine...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="mb-10 space-y-2">
        <Link 
          href="/dashboard/attachments"
          className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-[#E32222] transition-colors uppercase tracking-widest group mb-4"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          Governance Dashboard
        </Link>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">Attachment Center</h1>
        <p className="text-gray-500 text-sm font-medium">Link entities or upload individual polymorphic documents.</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-[2rem] w-fit mb-10 border border-gray-200 shadow-sm">
        <button
          onClick={() => setActiveFlow('BUNDLE')}
          className={`flex items-center gap-3 px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${
            activeFlow === 'BUNDLE' 
            ? 'bg-white text-gray-900 shadow-lg' 
            : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Layers size={14} className={activeFlow === 'BUNDLE' ? 'text-[#E32222]' : ''} />
          Flow A: Registration Bundle
        </button>
        <button
          onClick={() => setActiveFlow('INDIVIDUAL')}
          className={`flex items-center gap-3 px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${
            activeFlow === 'INDIVIDUAL' 
            ? 'bg-white text-gray-900 shadow-lg' 
            : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <FileUp size={14} className={activeFlow === 'INDIVIDUAL' ? 'text-blue-500' : ''} />
          Flow B: Individual Doc
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Form Column */}
        <div className="lg:col-span-12 xl:col-span-8">
          <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-xl shadow-gray-200/50">
            {activeFlow === 'BUNDLE' ? (
              <form onSubmit={handleBundleSubmit} className="space-y-8">
                <div className="p-6 bg-red-50/50 rounded-[2rem] border border-red-100 flex gap-4 text-xs font-bold leading-relaxed text-gray-700">
                  <Info className="flex-shrink-0 text-[#E32222]" size={18} />
                  <p>
                    <span className="text-[#E32222] font-black uppercase">Flow A (3-ID Link):</span> Establishes a permanent master link between a Partner, Vehicle, and Vendor. Used during primary onboarding.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className={labelClass}><Globe size={12} className="text-red-500" /> Operational City</label>
                    <select 
                      className={inputClass}
                      required
                      value={bundleData.cityCode}
                      onChange={e => setBundleData({...bundleData, cityCode: e.target.value})}
                    >
                      <option value="">Select City...</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.code}>{city.cityName} ({city.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}><User size={12} className="text-blue-500" /> Partner Custom ID</label>
                    <input 
                      type="text"
                      className={inputClass}
                      required
                      placeholder="e.g. ACPBLR01"
                      value={bundleData.partnerCustomId}
                      onChange={e => setBundleData({...bundleData, partnerCustomId: e.target.value.toUpperCase()})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}><Car size={12} className="text-emerald-500" /> Vehicle Custom ID</label>
                    <input 
                      type="text"
                      className={inputClass}
                      required
                      placeholder="e.g. ACVHBLR01"
                      value={bundleData.vehicleCustomId}
                      onChange={e => setBundleData({...bundleData, vehicleCustomId: e.target.value.toUpperCase()})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}><Building2 size={12} className="text-orange-500" /> Vendor Custom ID</label>
                    <input 
                      type="text"
                      className={inputClass}
                      required
                      placeholder="e.g. ACVBLR01"
                      value={bundleData.vendorCustomId}
                      onChange={e => setBundleData({...bundleData, vendorCustomId: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Operational Notes</label>
                  <textarea 
                    className={`${inputClass} min-h-[100px] resize-none`}
                    placeholder="Reference previous onboarding ticket or special case details..."
                    value={bundleData.notes}
                    onChange={e => setBundleData({...bundleData, notes: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gray-900 hover:bg-black text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-gray-300 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <ClipboardPaste size={18} className="text-[#E32222]" />}
                  Establish Master Link
                </button>
              </form>
            ) : (
              <form onSubmit={handleIndividualSubmit} className="space-y-8">
                 <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex gap-4 text-xs font-bold leading-relaxed text-gray-700">
                  <Info className="flex-shrink-0 text-blue-500" size={18} />
                  <p>
                    <span className="text-blue-500 font-black uppercase">Flow B (Polymorphic):</span> Upload specific documents for existing entities. Supports cross-entity document management.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                    <label className={labelClass}>Reference Category</label>
                    <select 
                      className={inputClass}
                      value={individualData.referenceType}
                      onChange={e => setIndividualData({...individualData, referenceType: e.target.value})}
                    >
                      <option value="PARTNER">Partner</option>
                      <option value="VENDOR">Vendor</option>
                      <option value="VEHICLE">Vehicle</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>Reference ID / Custom ID</label>
                    <div className="relative">
                      <input 
                        type="text"
                        className={inputClass}
                        required
                        placeholder="e.g. ACPBLR01"
                        value={individualData.referenceId}
                        onChange={e => setIndividualData({...individualData, referenceId: e.target.value})}
                      />
                      <Database className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>Document Type</label>
                    <select 
                      className={inputClass}
                      value={individualData.fileType}
                      onChange={e => setIndividualData({...individualData, fileType: e.target.value})}
                    >
                      <option value="DRIVING_LICENSE">Driving License</option>
                      <option value="RC_BOOK">RC Book</option>
                      <option value="INSURANCE">Insurance</option>
                      <option value="PERMIT">Permit</option>
                      <option value="PAN_CARD">PAN Card</option>
                      <option value="GST_CERT">GST Certificate</option>
                      <option value="OTHER">Other Documents</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>File Storage URL</label>
                    <input 
                      type="url"
                      className={inputClass}
                      required
                      placeholder="https://storage.com/bucket/doc.pdf"
                      value={individualData.fileUrl}
                      onChange={e => setIndividualData({...individualData, fileUrl: e.target.value})}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gray-900 hover:bg-black text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-gray-300 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <FileUp size={18} className="text-blue-500" />}
                  Register Document
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
           <div className="bg-gray-900 p-8 rounded-[3rem] text-white space-y-6 shadow-2xl shadow-gray-400/20">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#E32222]">System Guidelines</h3>
              <div className="space-y-4">
                 <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">1</div>
                    <p className="text-[10px] font-bold text-gray-300 leading-relaxed uppercase">Verify all Custom IDs before submission to avoid orphan records.</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">2</div>
                    <p className="text-[10px] font-bold text-gray-300 leading-relaxed uppercase">File URLs must be publicly accessible or from approved buckets.</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">3</div>
                    <p className="text-[10px] font-bold text-gray-300 leading-relaxed uppercase">Attachments require secondary verification by a Senior Admin.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
