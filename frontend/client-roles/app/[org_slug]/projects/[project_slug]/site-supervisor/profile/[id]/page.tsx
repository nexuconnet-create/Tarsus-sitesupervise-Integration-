"use client";

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMemberships } from '@/lib/hooks/useMemberships';
import {
    X, User, Zap, Phone, Mail, MapPin,
    FileText, Briefcase, Award, BarChart,
    Calendar, MessageSquare, Folder
} from 'lucide-react';
import {
    CurrentAssignmentTab,
    CertificationsTab,
    PerformanceTab,
    AvailabilityTab,
    CommunicationTab,
    DocumentsTab
} from '../../component/StartTabContent';
import CrewHeader from '../../component/CrewHeader';

export default function CrewProfilePage() {
    const router = useRouter();
    const params = useParams();
    const orgSlug = params.org_slug as string;
    const projectSlug = params.project_slug as string;
    const { getProject } = useMemberships();
    const project = getProject(orgSlug, projectSlug);
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const member = {
        name: 'Mike',
        surname: 'Johnson',
        id: 'STL-045'
    };

    return (
        <div className="p-6 md:p-8 space-y-8 bg-[#F8F9FA] min-h-screen">
            <CrewHeader title="Crew Member Profile" project={project?.name || projectSlug} />

            <div className="space-y-8">
                {/* Top Summary */}
                <div>
                    <h3 className="text-sm font-bold text-[#021422] uppercase tracking-wider mb-6">Top Summary</h3>
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <User className="text-[#021422]" size={20} />
                                <span className="text-[#021422] text-sm font-medium">{member.name} {member.surname}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Zap className="text-[#021422]" size={20} />
                                <span className="text-[#021422] text-sm">
                                    <span className="font-bold text-gray-500">Lead Steel Fixer</span> <span className="text-gray-300 mx-2">|</span>
                                    Crew A <span className="text-gray-300 mx-2">|</span> 7 years experience
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="text-[#021422]" size={20} />
                                <span className="text-[#021422] text-sm">+ 1 (555) 123-4567</span>
                                <span className="text-gray-300 mx-2">|</span>
                                <Mail className="text-gray-400" size={18} />
                                <span className="text-[#021422] text-sm">mike.j@abconstruction.com</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <MapPin className="text-[#021422]" size={20} />
                                <span className="text-[#021422] text-sm">Current Location: Grid BS (GPS verified)</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <FileText className="text-[#021422]" size={20} />
                                <span className="text-[#021422] text-sm">
                                    Status: On-site <span className="text-gray-300 mx-2">|</span>
                                    Clocked in: 06:58 <span className="text-gray-300 mx-2">|</span>
                                    Hours: 3.5/8
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid for triggering Modals */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    <GridButton
                        onClick={() => setActiveModal('assignment')}
                        icon={<Briefcase size={24} />}
                        label="Current Assignment"
                    />
                    <GridButton
                        onClick={() => setActiveModal('certifications')}
                        icon={<Award size={24} />}
                        label="Certifications"
                    />
                    <GridButton
                        onClick={() => setActiveModal('performance')}
                        icon={<BarChart size={24} />}
                        label="Performance"
                    />
                    <GridButton
                        onClick={() => setActiveModal('availability')}
                        icon={<Calendar size={24} />}
                        label="Availability"
                    />
                    <GridButton
                        onClick={() => setActiveModal('communication')}
                        icon={<MessageSquare size={24} />}
                        label="Communication"
                    />
                    <GridButton
                        onClick={() => setActiveModal('documents')}
                        icon={<Folder size={24} />}
                        label="Documents"
                    />
                </div>
            </div>

            {/* Modals Rendering */}
            <SubModal
                isOpen={activeModal === 'assignment'}
                onClose={() => setActiveModal(null)}
                title="CURRENT ASSIGNMENT TABS"
            >
                <CurrentAssignmentTab />
            </SubModal>

            <SubModal
                isOpen={activeModal === 'certifications'}
                onClose={() => setActiveModal(null)}
                title="CERTIFICATIONS"
            >
                <CertificationsTab />
            </SubModal>

            <SubModal
                isOpen={activeModal === 'availability'}
                onClose={() => setActiveModal(null)}
                title="AVAILABILITY"
            >
                <AvailabilityTab />
            </SubModal>

            <SubModal
                isOpen={activeModal === 'performance'}
                onClose={() => setActiveModal(null)}
                title="PERFORMANCE"
            >
                <PerformanceTab />
            </SubModal>

            <SubModal
                isOpen={activeModal === 'communication'}
                onClose={() => setActiveModal(null)}
                title="COMMUNICATION"
            >
                <CommunicationTab />
            </SubModal>

            <SubModal
                isOpen={activeModal === 'documents'}
                onClose={() => setActiveModal(null)}
                title="DOCUMENTS"
            >
                <DocumentsTab />
            </SubModal>

        </div>
    );
}

function GridButton({ onClick, icon, label }: { onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-4 p-8 bg-[#021422] text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg text-center aspect-square"
        >
            <div className="p-3 bg-white/10 rounded-lg">
                {icon}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </button>
    );
}

function SubModal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-8 border-b border-gray-100">
                    <h3 className="text-sm font-black text-[#021422] uppercase tracking-[0.2em]">{title}</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>
        </div>
    );
}
