"use client";

import { useParams, useRouter } from "next/navigation";
import { Win98Window } from "~/components/win98-window";
import { useGetFormById, useGetFormAnalytics } from "~/hooks/api/form";
import { SummaryStatsRow } from "~/components/analytics/summary-stats-row";
import { ChartPanel } from "~/components/analytics/chart-panel";
import { SubmissionTimelineChart } from "~/components/analytics/submission-timeline-chart";
import { FieldDistributionsPanel } from "~/components/analytics/field-distributions-panel";

export default function FormAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  const { form } = useGetFormById(formId);
  const { analytics, isLoading } = useGetFormAnalytics(formId);

  if (!formId) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-white">
        Invalid form ID
      </div>
    );
  }

  return (
    <Win98Window
      title={form ? `Analytics - ${form.title}` : "Analytics"}
      defaultPosition={{ x: 40, y: 30, width: 860, height: 560 }}
      onClose={() => router.push(`/builder/${formId}`)}
    >
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center gap-2 pb-1 border-b border-[#808080] shrink-0">
          <button onClick={() => router.push(`/builder/${formId}`)}>
            ← Back to Builder
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm">Loading analytics...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <div className="shrink-0">
              <SummaryStatsRow
                stats={[
                  {
                    label: "Total Submissions",
                    value: analytics?.totalSubmissions ?? 0,
                    icon: "📊",
                  },
                  {
                    label: "Submissions Today",
                    value: analytics?.submissionsToday ?? 0,
                    icon: "📅",
                  },
                  {
                    label: "Fields",
                    value: form?.fields?.length ?? 0,
                    icon: "📝",
                  },
                ]}
              />
            </div>

            <div className="flex-1 grid grid-cols-2 gap-2 min-h-0">
              <ChartPanel title="Submissions Over Time">
                <SubmissionTimelineChart data={analytics?.timeline ?? []} />
              </ChartPanel>
              <ChartPanel title="Field Response Distribution">
                <FieldDistributionsPanel
                  distributions={analytics?.fieldDistributions ?? []}
                />
              </ChartPanel>
            </div>
          </div>
        )}
      </div>
    </Win98Window>
  );
}
