const StatusBadge = ({ status }) => {
  const colors = {
    OPEN: "bg-blue-100 text-blue-700", IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    WAITING: "bg-purple-100 text-purple-700", ON_HOLD: "bg-gray-100 text-gray-600",
    RESOLVED: "bg-green-100 text-green-700", "완료": "bg-green-100 text-green-700",
    "대기": "bg-yellow-100 text-yellow-700", "진행 중": "bg-blue-100 text-blue-700",
    "종료": "bg-gray-100 text-gray-600",
  };
  const labels = { OPEN: "신규", IN_PROGRESS: "진행 중", WAITING: "대기", ON_HOLD: "보류", RESOLVED: "해결" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}>{labels[status] || status}</span>;
};

export default StatusBadge;
