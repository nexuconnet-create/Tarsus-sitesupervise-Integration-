import React from "react";

interface DashboardSectionProps {
    title: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ title, children, icon }) => {
    return (
        <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                {icon && <span className="text-gray-700">{icon}</span>}
                <h2 className="text-gray-900 text-xl font-bold tracking-tight uppercase">
                    {title}
                </h2>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {children}
            </div>
        </section>
    );
};

export default DashboardSection;
