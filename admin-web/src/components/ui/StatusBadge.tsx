interface StatusBadgeProps {
  active?: boolean;
  verified?: boolean;
  value?: boolean;
  label?: string;
}

export default function StatusBadge({ active, verified, value, label }: StatusBadgeProps) {
  if (typeof label === "string" && typeof value === "boolean") {
    return (
      <span className={`px-2 py-0.5 rounded text-[15px] font-medium mr-1 ${value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {label}: {value ? "True" : "False"}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <span className={`rounded-full px-2 py-1 text-xs ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        Active: {active ? "True" : "False"}
      </span>
      <span className={`rounded-full px-2 py-1 text-xs ${verified ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
        Verified: {verified ? "True" : "False"}
      </span>
    </div>
  );
}
