"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  AuthError,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { toast } from "sonner";
import { handleUserSession } from "../firebase/session";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Handle session
        await handleUserSession(firebaseUser);

        // Get additional user data from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        const role = userDoc.data()?.role;

        let userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          role: role || "user",
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          enrolledCourses: [],
          completedLessons: {},
          progress: {},
          completedCourses: [],
        };

        if (userDoc.exists()) {
          // Merge Firestore data with auth data
          userData = {
            ...userData,
            ...(userDoc.data() as Partial<User>),
          };
        } else {
          // Create user document if it doesn't exist
          await setDoc(userDocRef, userData);
        }

        setUser(userData);
      } else {
        // Clear session
        await handleUserSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const newUser: User = {
        id: userCredential.user.uid,
        email: email,
        name: name,
        role: "user",
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        enrolledCourses: [],
        completedLessons: {},
        progress: {},
        completedCourses: [],
      };

      await setDoc(doc(db, "users", userCredential.user.uid), newUser);
      setUser(newUser);
      router.push("/courses");
      toast.success("Account created successfully!");
    } catch (error) {
      const authError = error as AuthError;
      console.error("Sign up error:", authError);
      toast.error(authError.message || "Failed to create account");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
