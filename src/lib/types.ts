// User interface
export interface User {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    createdAt: string;
    lastActive: string;
    enrolledCourses: string[];
    completedLessons: Record<string, string[]>;
    progress: Record<string, number>;
    completedCourses: string[];
  }