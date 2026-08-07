import React from "react";
import { LucideIcon } from "lucide-react";

interface QuickAction {
    label: string;
    icon: LucideIcon;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "danger" | "dark";
}

interface QuickActionBarProps {
    actions: QuickAction[];
    title?: string;
}

const QuickActionBar: React.FC<QuickActionBarProps> = ({ actions, title }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-t border-gray-200 px-6 py-3 md:ml-[80px] lg:ml-[280px] transition-all duration-300">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                {title && (
                    <div className="text-sm font-bold text-gray-500 uppercase tracking-widest hidden md:block">
                        {title}
                    </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto">
                    {actions.map((action, index) => {
                        const Icon = action.icon;
                        const variants = {
                            primary: "bg-[#0166B0] hover:bg-[#015590] text-white",
                            secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200",
                            danger: "bg-red-600 hover:bg-red-700 text-white",
                            dark: "bg-[#021422] hover:bg-[#03253a] text-white",
                        };

                        return (
                            <button
                                key={index}
                                onClick={action.onClick}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded font-medium text-sm transition-colors ${variants[action.variant || "dark"]
                                    }`}
                            >
                                <Icon size={16} />
                                <span>{action.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default QuickActionBar;
