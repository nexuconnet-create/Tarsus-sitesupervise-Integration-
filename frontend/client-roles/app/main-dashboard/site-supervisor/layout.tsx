import Sidebar from "./component/Sidebar";

const CrewLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-full w-full bg-[#E3E3E3]">
                <div className="">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default CrewLayout;
