// client/src/pages/signup.tsx
import { useState } from "react";
import { useLocation } from "wouter";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
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
      // 1) Create Firebase user
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // 2) Update display name
      if (fullName) {
        await updateProfile(cred.user, { displayName: fullName });
      }

      // 3) Save basic profile in Firestore (optional but useful later)
      await setDoc(doc(db, "users", cred.user.uid), {
        fullName,
        email,
        createdAt: serverTimestamp(),
      });

      // 4) Initialize onboarding progress doc (optional)
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
        description: "Welcome! Let’s set up your Aligned profile.",
      });

      // 5) Go straight into onboarding
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create your Aligned account
            </h1>
            <p className="text-sm text-muted-foreground">
              We&apos;ll walk you through a short setup to personalize your
              rhythm.
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
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Get started"}
            </Button>
          </form>

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
