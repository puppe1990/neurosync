export default function GameLoading() {
  return (
    <div className="min-h-screen bg-[#fff7e8] p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="animate-pulse rounded-[2rem] border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="mt-4 h-10 w-64 rounded bg-gray-200" />
          <div className="mt-6 h-5 w-full rounded bg-gray-200" />
          <div className="mt-3 h-5 w-5/6 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
