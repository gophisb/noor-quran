export default function Background() {
  return (
    <>
      <div className="cosmos" aria-hidden />
      <svg
        className="geometry"
        viewBox="0 0 1400 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <linearGradient id="gl" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5eead4" stopOpacity="0.5" />
            <stop offset="1" stopColor="#5eead4" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#gl)" strokeWidth="0.8">
          <g className="spin-slow" style={{ transformOrigin: "300px 420px" }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <ellipse
                key={i}
                cx="300"
                cy="420"
                rx="260"
                ry="110"
                transform={`rotate(${i * 15} 300 420)`}
              />
            ))}
          </g>
          <g className="spin-slow" style={{ transformOrigin: "1120px 380px", animationDirection: "reverse" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <polygon
                key={i}
                points="1120,160 1310,270 1310,490 1120,600 930,490 930,270"
                transform={`rotate(${i * 7.5} 1120 380) scale(${1 - i * 0.08}) translate(${(i * 0.08 * 1120) / (1 - i * 0.08)} ${(i * 0.08 * 380) / (1 - i * 0.08)})`}
              />
            ))}
          </g>
          <circle cx="700" cy="400" r="380" strokeDasharray="2 10" />
          <circle cx="700" cy="400" r="520" strokeDasharray="1 14" />
        </g>
      </svg>
    </>
  );
}
