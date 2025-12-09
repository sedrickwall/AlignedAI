// client/src/pages/signup.tsx
import { useState } from "react";
import { useLocation } from "wouter";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

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
  const [googleLoading, setGoogleLoading] = useState(false);

  // ---------------------------------------------------------
  // EMAIL + PASSWORD SIGNUP
  // ---------------------------------------------------------
  const handleEmailSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      if (fullName) {
        await updateProfile(cred.user, { displayName: fullName });
      }

      // Create Firestore user
      await setDoc(doc(db, "users", cred.user.uid), {
        fullName,
        email,
        createdAt: serverTimestamp(),
      });

      // Initialize onboarding record
      await setDoc(
        doc(db, "onboardingProgress", cred.user.uid),
        {
          userId: cred.user.uid,
          currentStep: 1,
          onboardingComplete: false,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast({
        title: "Account created",
        description: "Welcome! Let’s begin your onboarding.",
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

  // ---------------------------------------------------------
  // GOOGLE SIGNUP
  // ---------------------------------------------------------
  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);

      const displayName = cred.user.displayName || "User";

      await setDoc(
        doc(db, "users", cred.user.uid),
        {
          fullName: displayName,
          email: cred.user.email,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      await setDoc(
        doc(db, "onboardingProgress", cred.user.uid),
        {
          userId: cred.user.uid,
          currentStep: 1,
          onboardingComplete: false,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast({
        title: "Welcome!",
        description: "Your Google account has been created.",
      });

      navigate("/onboarding");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Google Sign Up failed",
        description: err.message || "Try again.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6 space-y-6">
          {/* HEADER */}
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create your Aligned account
            </h1>
            <p className="text-sm text-muted-foreground">
              We&apos;ll personalize your rhythm in a short setup.
            </p>
          </div>

          {/* EMAIL SIGNUP FORM */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                required
                value={fullName}
                autoComplete="name"
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button className="w-full mt-2" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating account..." : "Get started"}
            </Button>
          </form>

          {/* DIVIDER */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* GOOGLE SIGNUP BUTTON */}
          <Button
            variant="outline"
            disabled={googleLoading}
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-2 py-2"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-4 w-4"
            />
            {googleLoading ? "Connecting..." : "Sign up with Google"}
          </Button>

          {/* LOGIN LINK */}
          <p className="text-xs text-center text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              className="underline"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
