export default function FieldLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#E5E5E5] text-[#021422]">
            {children}
        </div>
    );
}
