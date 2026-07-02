import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth, voluntarySignOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginErrorMessage } from "@/lib/auth-errors";
import { loginSchema, type LoginFormValues } from "@/lib/schemas";
import { resolvePostLoginPath } from "@/routes/paths";

export function LoginPage() {
  const { user, login, isAuthenticating } = useAuth();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenant_slug: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    voluntarySignOut.current = false;
  }, []);

  if (user) {
    const from =
      (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? undefined;
    return <Navigate to={resolvePostLoginPath(user.role, from)} replace />;
  }

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values.tenant_slug, values.email, values.password);
    } catch (error) {
      setError("root", {
        message: loginErrorMessage(error),
      });
    }
  }

  return (
    <div className="fv-shell-page flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex items-center gap-3">
            <img src="/forevue-icon.svg" alt="" className="h-8 w-8" />
            <div>
              <CardTitle>Forevue</CardTitle>
              <CardDescription>Sign in to your institution workspace</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="tenant_slug">College</Label>
              <Input
                id="tenant_slug"
                autoComplete="organization"
                placeholder="demo-eng"
                {...register("tenant_slug")}
              />
              {errors.tenant_slug && (
                <p className="text-sm font-medium text-[var(--color-risk-high)]">{errors.tenant_slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[var(--color-risk-high)] text-sm font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-[var(--color-risk-high)] text-sm font-medium">{errors.password.message}</p>
              )}
            </div>

            {errors.root && (
              <p className="text-[var(--color-risk-high)] text-sm font-medium">{errors.root.message}</p>
            )}

            <Button type="submit" className="mt-2 w-full" disabled={isAuthenticating}>
              {isAuthenticating ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
