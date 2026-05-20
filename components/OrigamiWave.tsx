export default function OrigamiWave({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="2,14 6,10 10,14 14,8 18,14 22,10 22,18 2,18" />
    </svg>
  )
}
