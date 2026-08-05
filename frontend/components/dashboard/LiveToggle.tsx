interface LiveToggleProps {
  enabled: boolean;
  isConnected: boolean;
  onToggle: () => void;
}

export function LiveToggle({ enabled, isConnected, onToggle }: LiveToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-small font-medium transition-colors ${
        enabled
          ? "border-success/30 bg-success/10 text-success"
          : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          enabled && isConnected ? "bg-success animate-pulse" : enabled ? "bg-warning" : "bg-gray-300 dark:bg-gray-600"
        }`}
      />
      {enabled ? (isConnected ? "Live" : "Connecting…") : "Go live"}
    </button>
  );
}
