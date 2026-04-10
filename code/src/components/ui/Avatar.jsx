const Avatar = ({ name, size = "w-8 h-8", bg = "bg-indigo-100 text-indigo-600" }) => (
  <div className={`${size} ${bg} rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0`}>
    {name?.[0] || "?"}
  </div>
);

export default Avatar;
