'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Upload, CheckCircle, Clock, AlertTriangle, Loader2, Link as LinkIcon, FileCheck } from 'lucide-react';
import { vendorService } from '@/services/vendorService';
import { VendorAttachment } from '@/types';
import toast from 'react-hot-toast';

interface Document {
    id: string;
    name: string;
    type: string;
    status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'EXPIRED' | 'MISSING';
    expiryDate?: string;
    uploadDate?: string;
    url?: string;
}

const REQUIRED_DOCS = [
    { name: 'Trade License', type: 'LICENSE', backendType: 'OTHER' },
    { name: 'GST Certificate', type: 'GST', backendType: 'OTHER' },
    { name: 'PAN Card', type: 'PAN', backendType: 'PAN' },
    { name: 'Office Address Proof', type: 'ADDRESS', backendType: 'OTHER' },
    { name: 'Cancelled Cheque', type: 'BANK', backendType: 'CHEQUE' },
];

export default function VendorDocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState<string | null>(null);
    const [activeDoc, setActiveDoc] = useState<{name: string, backendType: string} | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    const fetchDocuments = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await vendorService.getAttachments();
            const apiAttachments = response.data || [];

            const mappedDocs: Document[] = REQUIRED_DOCS.map((required) => {
                const match = apiAttachments.find(a => a.fileType === required.backendType);
                
                if (match) {
                    return {
                        id: match.id,
                        name: required.name,
                        type: required.type,
                        status: (match.verificationStatus === 'VERIFIED' ? 'APPROVED' : 'PENDING') as any,
                        uploadDate: match.createdAt,
                        url: match.fileUrl
                    };
                }

                return {
                    id: required.type,
                    name: required.name,
                    type: required.type,
                    status: 'MISSING' as const,
                };
            });

            setDocuments(mappedDocs);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
            toast.error('Failed to load documents');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleUploadClick = (name: string, backendType: string) => {
        setActiveDoc({ name, backendType });
        // Use a small timeout to ensure the state is set before clicking
        setTimeout(() => {
            fileInputRef.current?.click();
        }, 100);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeDoc) return;

        // Check if PDF or Image
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload PDF, JPG, PNG or WEBP.');
            return;
        }

        try {
            setIsUploading(activeDoc.name);
            
            // 1. Upload the file to get a server URL
            const uploadResponse = await vendorService.uploadFile(file);
            const fileUrl = uploadResponse.data.fileUrl;

            // 2. Create the attachment record with this URL
            await vendorService.uploadAttachment({
                fileType: activeDoc.backendType,
                fileUrl: fileUrl
            });

            toast.success(`${activeDoc.name} uploaded successfully from device`);
            fetchDocuments();
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload file');
        } finally {
            setIsUploading(null);
            setActiveDoc(null);
            if (e.target) e.target.value = ''; // Reset input
        }
    };

    const handleUrlUpload = async (docName: string, backendType: string) => {
        const url = prompt(`Please enter the URL for ${docName}:`);
        if (!url) return;

        try {
            setIsUploading(docName);
            await vendorService.uploadAttachment({
                fileType: backendType,
                fileUrl: url
            });
            toast.success(`${docName} URL saved successfully`);
            fetchDocuments();
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to save URL');
        } finally {
            setIsUploading(null);
        }
    };

    const handleView = (url?: string) => {
        if (!url) {
            toast.error('No document URL available');
            return;
        }
        
        // If it's a relative path (starts with /uploads), prepend the API base URL
        const fullUrl = url.startsWith('/uploads') 
            ? `${API_BASE_URL}${url}` 
            : url;
            
        window.open(fullUrl, '_blank');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'text-green-600 bg-green-100 border-green-200';
            case 'PENDING': return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'REJECTED': return 'text-red-600 bg-red-100 border-red-200';
            case 'EXPIRED': return 'text-red-600 bg-red-100 border-red-200';
            case 'MISSING': return 'text-gray-500 bg-gray-100 border-gray-200';
            default: return 'text-gray-500 bg-gray-100 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
            case 'PENDING': return <Clock className="w-4 h-4" />;
            case 'REJECTED': return <AlertTriangle className="w-4 h-4" />;
            case 'EXPIRED': return <AlertTriangle className="w-4 h-4" />;
            case 'MISSING': return <Upload className="w-4 h-4" />;
            default: return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Loading documents...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Business Compliance</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Manage your KYC & operational documents securely.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">All Systems Operational</span>
                </div>
            </div>

            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,image/*"
                onChange={handleFileChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {documents.map((doc) => {
                    const requiredInfo = REQUIRED_DOCS.find(r => r.type === doc.type);
                    const isProcessing = isUploading === doc.name;

                    return (
                        <div key={doc.id} className="group relative bg-white rounded-3xl border border-gray-100 p-8 shadow-xl hover:shadow-2xl hover:border-red-500/20 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full">
                            {/* Decorative Background Element */}
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-red-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl text-white shadow-lg shadow-red-200 group-hover:scale-110 transition-transform duration-300">
                                        <FileText className="w-7 h-7" />
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${getStatusColor(doc.status)}`}>
                                        {getStatusIcon(doc.status)}
                                        {doc.status}
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-black text-gray-900 mb-2">{doc.name}</h3>
                                
                                {doc.expiryDate && (
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1">
                                        <Clock size={12} className="text-amber-500" />
                                        <span>Expires: {new Date(doc.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {doc.uploadDate ? (
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                        <FileCheck size={12} className="text-emerald-500" />
                                        <span>Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</span>
                                    </div>
                                ) : (
                                    <p className="text-xs text-red-400 font-bold italic">Action Required: Document Missing</p>
                                )}
                            </div>

                            <div className="relative z-10 mt-8 space-y-3">
                                {doc.status === 'MISSING' || doc.status === 'REJECTED' || doc.status === 'EXPIRED' ? (
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleUploadClick(doc.name, requiredInfo?.backendType || 'OTHER')}
                                            disabled={isProcessing}
                                            className="flex-1 py-3.5 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            ) : (
                                                <Upload className="w-4 h-4" />
                                            )}
                                            {isProcessing ? 'Processing...' : 'Upload from Device'}
                                        </button>
                                        <button 
                                            onClick={() => handleUrlUpload(doc.name, requiredInfo?.backendType || 'OTHER')}
                                            title="Provide URL instead"
                                            className="p-3.5 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 transition-all"
                                        >
                                            <LinkIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => handleView(doc.url)}
                                        className="w-full py-3.5 bg-gray-50 text-gray-900 border border-gray-100 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 hover:border-gray-200 transition-all shadow-sm active:scale-95"
                                    >
                                        View Document
                                    </button>
                                )}
                                
                                {doc.status === 'PENDING' && (
                                    <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                                        <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
                                        <span className="text-[10px] text-amber-700 font-black uppercase tracking-tighter">Verification in progress</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 p-8 bg-gray-50 rounded-[40px] border border-gray-100 shadow-inner">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Compliance Notice</h4>
                        <p className="text-gray-500 text-sm font-medium mt-1 leading-relaxed">
                            Ensuring your documents are up to date prevents service interruptions. Documents are typically verified within 24-48 business hours. 
                            Supported formats: <strong className="text-gray-900">PDF, JPG, PNG</strong>. Max size: <strong className="text-gray-900">5MB</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
