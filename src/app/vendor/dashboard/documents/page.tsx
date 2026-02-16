'use client';

import { useState } from 'react';
import { FileText, Upload, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Document {
    id: string;
    name: string;
    type: string;
    status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'EXPIRED' | 'MISSING';
    expiryDate?: string;
    uploadDate?: string;
}

export default function VendorDocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([
        { id: '1', name: 'Trade License', type: 'LICENSE', status: 'APPROVED', expiryDate: '2024-12-31', uploadDate: '2023-01-15' },
        { id: '2', name: 'GST Certificate', type: 'GST', status: 'APPROVED', uploadDate: '2023-01-15' },
        { id: '3', name: 'PAN Card', type: 'PAN', status: 'APPROVED', uploadDate: '2023-01-15' },
        { id: '4', name: 'Office Address Proof', type: 'ADDRESS', status: 'PENDING', uploadDate: '2023-10-26' },
        { id: '5', name: 'Cancelled Cheque', type: 'BANK', status: 'MISSING' },
    ]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'text-green-600 bg-green-100';
            case 'PENDING': return 'text-orange-600 bg-orange-100';
            case 'REJECTED': return 'text-red-600 bg-red-100';
            case 'EXPIRED': return 'text-red-600 bg-red-100 border-red-200';
            case 'MISSING': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
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

    return (
        <div className="animate-fade-in space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
                <p className="text-sm text-gray-500">Upload and manage your business documents and KYC.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => (
                    <div key={doc.id} className="card p-6 flex flex-col justify-between group hover:border-red-500/30 transition-all">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-red-50 rounded-xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(doc.status)}`}>
                                    {getStatusIcon(doc.status)}
                                    {doc.status}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">{doc.name}</h3>
                            {doc.expiryDate && (
                                <p className="text-xs text-gray-500">Expires: {new Date(doc.expiryDate).toLocaleDateString()}</p>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                            {doc.status === 'MISSING' || doc.status === 'REJECTED' || doc.status === 'EXPIRED' ? (
                                <button className="w-full py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                                    <Upload className="w-4 h-4" />
                                    Upload Document
                                </button>
                            ) : (
                                <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">
                                    View Document
                                </button>
                            )}
                            {doc.status === 'PENDING' && (
                                <p className="text-xs text-center text-orange-600 mt-2 font-medium">Verification in progress</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
