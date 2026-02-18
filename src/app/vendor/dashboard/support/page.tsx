'use client';

import { useState, useEffect } from 'react';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import { vendorService } from '@/services/vendorService';
import { toast } from 'react-hot-toast';

export default function VendorSupportPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        setIsLoading(true);
        try {
            // For now, fetching first ticket messages as a simplified view
            const tickets = await vendorService.getSupportTickets();
            if (tickets.success && tickets.data && tickets.data.length > 0) {
                // Assuming we select the first ticket or active one
                // setMessages(tickets.data[0].messages); 
                // Using mock response structure adaptation for now
                setMessages([
                    { id: 1, sender: 'You', text: 'Hi, I have an issue with my payout for last week.', time: '10:00 AM' },
                    { id: 2, sender: 'Admin', text: 'Hello! I can help with that. Can you provide the transaction ID?', time: '10:15 AM' }
                ]);
            }
        } catch (error) {
            console.error('Failed to load messages');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        setIsSending(true);
        try {
            // Assuming creating a new ticket or message on a general channel
            const response = await vendorService.createSupportTicket({
                subject: 'Support Request',
                message: inputText,
                priority: 'NORMAL'
            });

            if (response.success) {
                setMessages([...messages, {
                    id: Date.now(),
                    sender: 'You',
                    text: inputText,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                setInputText('');
            } else {
                toast.error('Failed to send message');
            }
        } catch (error) {
            toast.error('Error sending message');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="animate-fade-in h-[calc(100vh-140px)] flex flex-col">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Support</h1>
                <p className="text-sm text-gray-500">Contact admin for assistance.</p>
            </div>

            <div className="flex-1 card flex flex-col overflow-hidden border border-gray-200 shadow-sm">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">Admin Support</h3>
                        <span className="text-xs text-green-600 flex items-center gap-1">● Online</span>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-2xl p-3 px-4 shadow-sm ${msg.sender === 'You'
                                    ? 'bg-red-600 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                    }`}>
                                    <p className="text-sm">{msg.text}</p>
                                    <p className={`text-[10px] mt-1 text-right ${msg.sender === 'You' ? 'text-red-200' : 'text-gray-400'}`}>{msg.time}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type your message..."
                            disabled={isSending}
                            className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:bg-gray-50"
                        />
                        <button
                            type="submit"
                            disabled={isSending}
                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30 disabled:bg-red-400"
                        >
                            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-1" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
