import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import { generateFacultyContent, listCoursePlans } from "@/api/faculty";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ErrorState, LoadingState } from "@/design";
import { PageHeader } from "@/layout/PageHeader";
import { STAFF_PATHS } from "@/routes/paths";

export function FacultyLecturePlannerPage() {
  const navigate = useNavigate();
  const plans = useQuery({ queryKey: ["course-plans"], queryFn: listCoursePlans });
  const [courseCode, setCourseCode] = React.useState("");
  const [topic, setTopic] = React.useState("");

  const generate = useMutation({
    mutationFn: () =>
      generateFacultyContent("lecture_plan", {
        course_code: courseCode,
        topic,
      }),
    onSuccess: (job) => {
      if (job.result_artifact_id) {
        navigate(`/artifacts/${job.result_artifact_id}`);
      }
    },
  });

  if (plans.isLoading) return <LoadingState label="Loading courses…" />;

  return (
    <div className="pb-16">
      <PageHeader
        breadcrumbs={[{ label: "Teaching", href: STAFF_PATHS.teaching }, { label: "Lecture planner" }]}
        title="Lecture planner"
        description="Draft a session plan from your course syllabus — advisory only."
      />
      <Card className="max-w-lg">
        <CardContent className="space-y-4 p-5">
          <label className="block text-sm">
            Course
            <select
              className="mt-1 w-full rounded-md border border-[var(--border-subtle)] px-3 py-2"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
            >
              <option value="">Select course</option>
              {(plans.data ?? []).map((p) => (
                <option key={p.id} value={p.course_code}>
                  {p.course_code} — {p.course_name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Unit / topic
            <Input className="mt-1" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Normalization" />
          </label>
          {generate.isError && <ErrorState title="Generation failed" message="Try again with different inputs." />}
          <Button disabled={!courseCode || !topic || generate.isPending} onClick={() => generate.mutate()}>
            {generate.isPending ? "Generating…" : "Generate plan"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function FacultyCourseProgressPage() {
  const plans = useQuery({ queryKey: ["course-plans"], queryFn: listCoursePlans });

  if (plans.isLoading) return <LoadingState label="Loading progress…" />;
  if (plans.isError) {
    return <ErrorState title="Progress didn't load" message="Try again." onRetry={() => plans.refetch()} />;
  }

  return (
    <div className="pb-16">
      <PageHeader
        breadcrumbs={[{ label: "Teaching", href: STAFF_PATHS.teaching }, { label: "Course progress" }]}
        title="Course progress"
        description="Coverage vs teaching plan — honest gaps when sessions are not recorded."
      />
      {plans.data?.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No course plans connected for your account yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.data?.map((p) => {
            const pct = p.planned_sessions > 0 ? Math.round((100 * p.delivered_sessions) / p.planned_sessions) : 0;
            const slippage = p.planned_sessions > 0 && p.delivered_sessions < p.planned_sessions * 0.85;
            return (
              <Card key={p.id}>
                <CardContent className="p-5">
                  <p className="font-semibold">{p.course_code}</p>
                  <p className="text-sm text-[var(--text-muted)]">{p.course_name}</p>
                  <p className="fv-data mt-2 text-3xl font-extrabold">{pct}%</p>
                  <p className="text-sm">
                    {p.delivered_sessions} of {p.planned_sessions} sessions delivered
                    {slippage && <span className="ml-2 text-[var(--color-amber-700)]">· behind plan</span>}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function FacultyOfficeHoursPage() {
  const slots = useQuery({ queryKey: ["office-hours"], queryFn: () => import("@/api/faculty").then((m) => m.listOfficeHours()) });
  const [slotDate, setSlotDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("10:00");
  const [endTime, setEndTime] = React.useState("11:00");
  const [location, setLocation] = React.useState("");

  const create = useMutation({
    mutationFn: () =>
      import("@/api/faculty").then((m) =>
        m.createOfficeHour({
          slot_date: slotDate,
          start_time: startTime,
          end_time: endTime,
          location: location || undefined,
        }),
      ),
    onSuccess: () => slots.refetch(),
  });

  return (
    <div className="pb-16">
      <PageHeader
        breadcrumbs={[{ label: "Teaching", href: STAFF_PATHS.teaching }, { label: "Office hours" }]}
        title="Office hour scheduler"
        description="AI-layer calendar only — faculty confirms every slot; no ERP writes."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-5">
            <p className="font-semibold">Add availability</p>
            <Input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} />
            <div className="flex gap-2">
              <Input value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="Start" />
              <Input value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="End" />
            </div>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (optional)" />
            <Button disabled={!slotDate || create.isPending} onClick={() => create.mutate()}>
              Confirm slot
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="mb-3 font-semibold">Open slots</p>
            {slots.isLoading ? (
              <p className="text-sm text-[var(--text-muted)]">Loading…</p>
            ) : (slots.data ?? []).length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No office hours scheduled yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {slots.data?.map((s) => (
                  <li key={s.id}>
                    {s.slot_date} · {s.start_time}–{s.end_time}
                    {s.location ? ` · ${s.location}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GeneratorShell({
  title,
  feature,
  children,
  buildParams,
}: {
  title: string;
  feature: string;
  children: React.ReactNode;
  buildParams: () => Record<string, unknown>;
}) {
  const navigate = useNavigate();
  const generate = useMutation({
    mutationFn: () => generateFacultyContent(feature, buildParams()),
    onSuccess: (job) => {
      if (job.result_artifact_id) navigate(`/artifacts/${job.result_artifact_id}`);
    },
  });

  return (
    <div className="pb-16">
      <PageHeader
        breadcrumbs={[{ label: "Create", href: STAFF_PATHS.create }, { label: title }]}
        title={title}
        description="Advisory draft only — review before export or send."
      />
      <Card className="max-w-lg">
        <CardContent className="space-y-4 p-5">
          {children}
          <Button disabled={generate.isPending} onClick={() => generate.mutate()}>
            {generate.isPending ? "Generating…" : "Generate draft"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function FacultyCreateHubPage() {
  const links = [
    { to: `${STAFF_PATHS.create}/assessment`, label: "Assessment generator", sub: "Paper or quiz mode" },
    { to: `${STAFF_PATHS.create}/assignment`, label: "Assignment generator", sub: "Brief + rubric" },
    { to: `${STAFF_PATHS.create}/notice`, label: "Notice generator", sub: "Cohort notices" },
    { to: `${STAFF_PATHS.create}/email`, label: "Email generator", sub: "Scoped correspondence" },
  ];
  return (
    <div className="pb-16">
      <PageHeader eyebrow="Create" title="Create & draft" description="Generate teaching artifacts as editable drafts." />
      <div className="grid gap-4 md:grid-cols-2">
        {links.map((l) => (
          <Link key={l.to} to={l.to}>
            <Card className="h-full hover:shadow-md">
              <CardContent className="p-5">
                <p className="font-semibold">{l.label}</p>
                <p className="text-sm text-[var(--text-muted)]">{l.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function FacultyAssessmentGeneratorPage() {
  const [mode, setMode] = React.useState<"assessment_paper" | "assessment_quiz">("assessment_paper");
  const [course, setCourse] = React.useState("DBMS");
  const [topic, setTopic] = React.useState("");
  return (
    <GeneratorShell title="Assessment generator" feature={mode} buildParams={() => ({ course_code: course, topic })}>
      <div className="flex gap-2">
        <Button variant={mode === "assessment_paper" ? "default" : "secondary"} size="sm" onClick={() => setMode("assessment_paper")}>
          Paper
        </Button>
        <Button variant={mode === "assessment_quiz" ? "default" : "secondary"} size="sm" onClick={() => setMode("assessment_quiz")}>
          Quiz
        </Button>
      </div>
      <Input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Course code" />
      <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic / unit" />
    </GeneratorShell>
  );
}

export function FacultyAssignmentGeneratorPage() {
  const [course, setCourse] = React.useState("DBMS");
  const [topic, setTopic] = React.useState("");
  return (
    <GeneratorShell title="Assignment generator" feature="assignment" buildParams={() => ({ course_code: course, topic })}>
      <Input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Course code" />
      <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" />
    </GeneratorShell>
  );
}

export function FacultyNoticeGeneratorPage() {
  const [title, setTitle] = React.useState("");
  const [intent, setIntent] = React.useState("");
  return (
    <GeneratorShell title="Notice generator" feature="notice" buildParams={() => ({ title, intent })}>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notice title" />
      <Input value={intent} onChange={(e) => setIntent(e.target.value)} placeholder="What should the notice say?" />
    </GeneratorShell>
  );
}

export function FacultyEmailGeneratorPage() {
  const [subject, setSubject] = React.useState("");
  const [intent, setIntent] = React.useState("");
  const [recipient, setRecipient] = React.useState("student");
  const [consent, setConsent] = React.useState(false);
  return (
    <GeneratorShell
      title="Email generator"
      feature="email"
      buildParams={() => ({
        subject,
        intent,
        recipient_type: recipient,
        guardian_consent_confirmed: recipient === "parent" ? consent : true,
      })}
    >
      <select className="w-full rounded-md border px-3 py-2" value={recipient} onChange={(e) => setRecipient(e.target.value)}>
        <option value="student">Student</option>
        <option value="parent">Parent / guardian</option>
      </select>
      {recipient === "parent" && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          Guardian consent confirmed on file
        </label>
      )}
      <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
      <Input value={intent} onChange={(e) => setIntent(e.target.value)} placeholder="Intent / key points" />
    </GeneratorShell>
  );
}
