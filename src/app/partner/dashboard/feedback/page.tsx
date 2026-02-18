'use client';

import { useState } from 'react';
import { Star, User, Loader2 } from 'lucide-react';
import { partnerService } from '@/services/partnerService';
import { useEffect } from 'react';

export default function PartnerFeedbackPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await partnerService.getFeedback();
                if (response.success && response.data) {
                    setReviews(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch feedback');
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    return (
        <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Customer Feedback</h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-4xl font-black text-gray-900">4.8</span>
                    <div className="flex text-yellow-500">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} fill="currentColor" className="w-6 h-6" />)}
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">Based on 152 ratings</p>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-400" /></div>
                ) : reviews.map((review) => (
                    <div key={review.id} className="card p-6 transition-all hover:shadow-md">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{review.user}</h4>
                                    <p className="text-xs text-gray-400">{review.date}</p>
                                </div>
                            </div>
                            <div className="flex gap-0.5 text-yellow-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-gray-300'} />
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm ml-13 pl-13 leading-relaxed">"{review.comment}"</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
