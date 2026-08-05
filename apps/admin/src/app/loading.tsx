export default function Loading() {
  return (
    <div className="bg-background flex min-h-dvh items-center justify-center" role="status">
      <div className="animate-pergon-pulse bg-foreground size-2 rounded-full" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
