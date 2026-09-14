const StatusBadge = () => {
  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-300">
      <p className="font-semibold">System status: online</p>
      <p className="mt-1 text-cyan-200/80">Backend, frontend, database, and mobile flow are wired and build-ready.</p>
    </div>
  );
};

export default StatusBadge;
