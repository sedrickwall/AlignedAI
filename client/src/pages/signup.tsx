import { useState } from "react";
import { useLocation } from "wouter";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      if (fullName) {
        await updateProfile(cred.user, { displayName: fullName });
      }

      toast({
        title: "Account created",
        description: "Welcome! Let's set up your Aligned profile.",
      });

      navigate("/onboarding");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Sign up failed",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);

      toast({
        title: "Welcome!",
        description: "Let's personalize your daily rhythm.",
      });

      navigate("/onboarding");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Google sign up failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6 space-y-6">

          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-signup-title">
              Create your Aligned account
            </h1>
            <p className="text-sm text-muted-foreground">
              Personalized daily rhythms start here.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                data-testid="input-fullname"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                data-testid="input-password"
              />
            </div>

            <Button className="w-full mt-2" disabled={isSubmitting} type="submit" data-testid="button-signup">
              {isSubmitting ? "Creating..." : "Get started"}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            disabled={isSubmitting}
            onClick={handleGoogleSignup}
            data-testid="button-google-signup"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              className="h-5"
              alt="Google"
            />
            Sign up with Google
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              className="underline"
              onClick={() => navigate("/login")}
              data-testid="link-login"
            >
              Log in
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
