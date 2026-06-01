
const StatusBadge = ({ value, label }: { value: boolean; label: string }) => (
  <span className={`px-2 py-0.5 rounded text-[15px] font-medium mr-1 ${value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
    {label}: {value ? "True" : "False"}
  </span>
);

export default StatusBadge