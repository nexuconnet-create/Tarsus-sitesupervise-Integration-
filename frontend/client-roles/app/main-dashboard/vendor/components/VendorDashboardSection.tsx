import React from "react";

interface VendorDashboardSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const VendorDashboardSection: React.FC<VendorDashboardSectionProps> = ({
  title,
  children,
  icon,
  action,
}) => {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-700">{icon}</span>}
          <h2 className="text-gray-900 text-xl font-bold tracking-tight uppercase">
            {title}
          </h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {children}
      </div>
    </section>
  );
};

export default VendorDashboardSection;
