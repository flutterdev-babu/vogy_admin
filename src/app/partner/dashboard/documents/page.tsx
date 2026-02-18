'use client';

import { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { partnerService } from '@/services/partnerService';
import { toast } from 'react-hot-toast';

interface Document {
    id: string;
    name: string;
    status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'MISSING';
    expiryDate?: string;
}

export default function PartnerDocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            const response = await partnerService.getDocuments();
            if (response.success && response.data) {
                setDocuments(response.data);
            }
        } catch (error) {
            console.error('Failed to load documents');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (docId: string) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,application/pdf';

        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentId', docId);

            const toastId = toast.loading('Uploading document...');
            try {
                const response = await partnerService.uploadDocument(formData);
                if (response.success) {
                    toast.success('Document uploaded successfully', { id: toastId });
                    loadDocuments();
                } else {
                    toast.error(response.message || 'Upload failed', { id: toastId });
                }
            } catch (error) {
                toast.error('Error uploading document', { id: toastId });
            }
        };

        input.click();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'text-green-600';
            case 'PENDING': return 'text-orange-600';
            case 'REJECTED': return 'text-red-600';
            case 'MISSING': return 'text-gray-400';
            default: return 'text-gray-400';
        }
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-400" /></div>;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
                <p className="text-sm text-gray-500">Keep your documents up to date to avoid service disruption.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                    <div key={doc.id} className="card p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-gray-50 ${getStatusColor(doc.status)}`}>
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{doc.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs font-bold ${getStatusColor(doc.status)}`}>
                                        {doc.status}
                                    </span>
                                    {doc.expiryDate && (
                                        <span className="text-xs text-gray-400">• Expires: {new Date(doc.expiryDate).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleUpload(doc.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                            title={doc.status === 'MISSING' || doc.status === 'REJECTED' ? 'Upload Document' : 'View/Update'}
                        >
                            {doc.status === 'APPROVED' ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : doc.status === 'PENDING' ? (
                                <Clock className="w-5 h-5 text-orange-500" />
                            ) : (
                                <Upload className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                ))}
            </div>
            {documents.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>No documents required yet.</p>
                </div>
            )}
        </div>
    );
}
