import { InstructorProfile } from "./_components/instructor-profile";
import { instructors } from "@/data";

export function generateStaticParams() {
  return instructors.map((instructor) => ({
    id: instructor.id,
  }));
}

export default function InstructorPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <InstructorProfile />
    </div>
  );
}
