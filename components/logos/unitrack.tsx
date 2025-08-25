const UniTrack = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Location pin base */}
    <path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      fill="currentColor"
      opacity="0.8"
    />
    {/* Center dot */}
    <circle cx="12" cy="9" r="2.5" fill="white" />
    {/* Check mark inside */}
    <path
      d="M10.5 8.5L11.5 9.5L13.5 7.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Bottom tracking dots */}
    <circle cx="8" cy="20" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="12" cy="21" r="1" fill="currentColor" opacity="0.8" />
    <circle cx="16" cy="20" r="1" fill="currentColor" opacity="0.6" />
  </svg>
);

export default UniTrack;
