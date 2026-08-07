export default function SelectOrgLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#021422] border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading organizations...</p>
      </div>
    </div>
  );
}
