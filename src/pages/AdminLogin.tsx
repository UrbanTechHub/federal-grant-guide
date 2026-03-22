import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, AlertCircle, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading, signIn } = useAuth();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Check if admin exists
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const { count } = await supabase
          .from("user_roles")
          .select("*", { count: "exact", head: true })
          .eq("role", "admin");
        setNeedsSetup(count === 0);
      } catch {
        setNeedsSetup(false);
      } finally {
        setIsCheckingSetup(false);
      }
    };
    checkSetup();
  }, []);

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate("/admin/dashboard");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (needsSetup) {
      // Create admin account via edge function
      try {
        const { data: result, error: fnError } = await supabase.functions.invoke("create-admin", {
          body: { email: data.email, password: data.password },
        });

        if (fnError) {
          setError(fnError.message || "Failed to create admin account.");
          setIsLoading(false);
          return;
        }

        if (result?.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }

        // Admin created, now sign in
        setNeedsSetup(false);
        setSuccessMessage("Admin account created! Signing you in...");
        const { error: signInError } = await signIn(data.email, data.password);
        if (signInError) {
          setError(signInError.message);
        }
        setIsLoading(false);
      } catch {
        setError("Network error. Please check your connection and try again.");
        setIsLoading(false);
      }
      return;
    }

    try {
      const { error: signInError } = await signIn(data.email, data.password);
      if (signInError) {
        const msg = signInError.message;
        if (msg.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else if (msg === "Load failed" || msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
          setError("Network error. Please check your connection and try again.");
        } else {
          setError(msg);
        }
        setIsLoading(false);
        return;
      }
      setTimeout(() => setIsLoading(false), 1500);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  if (authLoading || isCheckingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-2xl border border-border p-8 shadow-gov-medium">
          {/* Header */}
          <div className="text-center mb-8">
            <img src={logo} alt="Logo" className="h-12 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground font-display">
              {needsSetup ? "Admin Setup" : "Admin Portal"}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {needsSetup
                ? "Create your admin account to get started"
                : "Sign in to access the dashboard"}
            </p>
          </div>

          {needsSetup && (
            <Alert className="mb-6 border-primary/30 bg-primary/5">
              <UserPlus className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground text-sm">
                No admin account exists yet. Enter your email and password to create one.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mb-6 border-green-500/30 bg-green-500/5">
              <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {needsSetup ? "Creating Account..." : "Signing in..."}
                  </>
                ) : needsSetup ? (
                  "Create Admin Account"
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
