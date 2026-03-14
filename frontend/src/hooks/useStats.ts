import { useState, useEffect } from 'react';
import { fetchStats } from '../api';

interface Stats {
  perm_records: number;
  lca_records?: number;
  total_records: number;
  unique_employers: number;
}

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchStats().then(data => setStats(data as unknown as Stats));
  }, []);

  return stats;
}
