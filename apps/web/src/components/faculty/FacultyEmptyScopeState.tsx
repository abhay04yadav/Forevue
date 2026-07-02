import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FacultyEmptyScopeState({ title = "No cohort assigned yet" }: { title?: string }) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <p className="text-lg font-semibold text-[var(--text-strong)]">{title}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-muted)]">
          Your account does not have a teaching scope yet. Ask your college admin to assign department,
          programme, or course scopes before you can view students and teaching tools.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/settings">Account settings</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
