// client/src/pages/signup.tsx
import { useState } from "react";
import { useLocation } from "wouter";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup
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

  // ---------------------------------------------
  // EMAIL + PASSWORD SIGN UP
  // ---------------------------------------------
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

      // 3) Save user profile
      await setDoc(doc(db, "users", cred.user.uid), {
        fullName,
        email,
        createdAt: serverTimestamp(),
      });

      // 4) Initialize onboarding document 🔥🔥🔥 (THIS IS STEP 3)
      await setDoc(
        doc(db, "onboarding", cred.user.uid),
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

      // 5) Redirect to onboarding
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

  // ---------------------------------------------
  // GOOGLE SIGN UP
  // ---------------------------------------------
  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);

      // Ensure onboarding doc exists
      await setDoc(
        doc(db, "onboarding", cred.user.uid),
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
        description: "Let’s personalize your daily rhythm.",
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
            <h1 className="text-2xl font-semibold tracking-tight">
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
              />
            </div>

            <Button className="w-full mt-2" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating..." : "Get started"}
            </Button>
          </form>

          {/* GOOGLE BUTTON */}
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            disabled={isSubmitting}
            onClick={handleGoogleSignup}
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
