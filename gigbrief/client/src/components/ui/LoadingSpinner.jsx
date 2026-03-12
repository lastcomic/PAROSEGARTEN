export default function LoadingSpinner({ size = 'md' }) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizeMap[size]} border-2 border-gb-border border-t-gb-blue rounded-full animate-spin`} />
    </div>
  );
}
