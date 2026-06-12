'use client';

import { useEffect } from 'react';
import { useGetGlobalAnalytics } from '~/hooks/api/form';
import { SummaryStatsRow } from '~/components/analytics/summary-stats-row';
import { ChartPanel } from '~/components/analytics/chart-panel';
import { SubmissionTimelineChart } from '~/components/analytics/submission-timeline-chart';
import { FormsLeaderboardChart } from '~/components/analytics/forms-leaderboard-chart';
import { useWindowManager } from '~/components/windows-context';

function GlobalAnalyticsWindowContent() {
  const { analytics, isLoading } = useGetGlobalAnalytics();

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="shrink-0">
        <SummaryStatsRow
          stats={[
            { label: 'Total Forms', value: analytics?.totalForms ?? 0, icon: '📋' },
            { label: 'Total Submissions', value: analytics?.totalSubmissions ?? 0, icon: '📊' },
            {
              label: 'Active Forms',
              value: analytics?.formsRanked?.filter((f: any) => f.submissionCount > 0).length ?? 0,
              icon: '✅',
            },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm">Loading analytics...</p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-2 gap-2 min-h-0">
          <ChartPanel title="Form Leaderboard">
            <FormsLeaderboardChart data={analytics?.formsRanked ?? []} />
          </ChartPanel>
          <ChartPanel title="Submission Activity">
            <SubmissionTimelineChart data={analytics?.submissionActivity ?? []} />
          </ChartPanel>
        </div>
      )}
    </div>
  );
}

export default function GlobalAnalyticsPage() {
  const { openWindow } = useWindowManager();

  useEffect(() => {
    openWindow('global-analytics', 'My Analytics', <GlobalAnalyticsWindowContent />, { x: 80, y: 50, width: 860, height: 560 });
  }, [openWindow]);

  return null;
}
