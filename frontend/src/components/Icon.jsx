const icons = {
  paper: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </>
  ),
  plastic: (
    <>
      <path d="M9 2h6" />
      <path d="M10 2v4l-2 3v10a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V9l-2-3V2" />
      <path d="M8 13h8" />
    </>
  ),
  glass: (
    <>
      <path d="M8 2h8l-1 8a4 4 0 0 1-6 0Z" />
      <path d="M12 12v8" />
      <path d="M9 22h6" />
    </>
  ),
  metal: (
    <>
      <path d="M7 4h10" />
      <path d="M6 7h12l-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2Z" />
      <path d="M9 11h6" />
    </>
  ),
  electronic: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
      <path d="M10 6h4" />
    </>
  ),
  organic: (
    <>
      <path d="M12 22V11" />
      <path d="M12 11C8 11 5 8 5 4c4 0 7 3 7 7Z" />
      <path d="M12 13c4 0 7-3 7-7-4 0-7 3-7 7Z" />
    </>
  ),
  recycle: (
    <>
      <path d="m7 19-2-3 2-3" />
      <path d="M5 16h7" />
      <path d="m17 5 2 3-2 3" />
      <path d="M19 8h-7" />
      <path d="m8 5 4-2 4 2" />
      <path d="m16 19-4 2-4-2" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 8 4-8 4-8-4Z" />
      <path d="m4 12 8 4 8-4" />
      <path d="m4 17 8 4 8-4" />
    </>
  ),
  status: (
    <>
      <path d="M20 6 9 17l-5-5" />
    </>
  ),
  alert: (
    <>
      <path d="m21 16-8.5-14a1 1 0 0 0-1.7 0L2 16a1 1 0 0 0 .85 1.5h18.3A1 1 0 0 0 21 16Z" />
      <path d="M12 7v4" />
      <path d="M12 15h.01" />
    </>
  ),
};

function Icon({ name, size = 18, className = '', strokeWidth = 2, ...props }) {
  return (
    <svg
      className={`vd-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {icons[name] || icons.recycle}
    </svg>
  );
}

export default Icon;
