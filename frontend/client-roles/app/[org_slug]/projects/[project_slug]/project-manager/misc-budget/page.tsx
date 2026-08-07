import MiscBudgetView from "@/app/[org_slug]/projects/[project_slug]/_components/misc-budget/MiscBudgetView";
import BackButton from "@/components/BackButton";

export default function PMMiscBudgetPage() {
  return (
    <>
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <BackButton />
        <span className="text-sm font-bold uppercase tracking-wide text-[#021422]">
          EVM / Misc Budget
        </span>
      </div>
      <MiscBudgetView />
    </>
  );
}
