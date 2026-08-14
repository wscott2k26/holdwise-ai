import React from "react";
import { Award, Lock } from "lucide-react";
import { useEntitlement } from "@/lib/billing";
import { completionCount } from "@/lib/progress";

const ACHIEVEMENTS = [
  { id: "first-lesson", title: "First Lesson", desc: "Complete your first lesson.", type: "lessons", value: 1 },
  { id: "suit-spotter", title: "Suit Spotter", desc: "Finish the suits unit.", type: "lessons", value: 6 },
  { id: "rank-ranger", title: "Rank Ranger", desc: "Finish the ranks unit.", type: "lessons", value: 7 },
  { id: "pair-pro", title: "Pair Pro", desc: "Finish the matching unit.", type: "lessons", value: 6 },
  { id: "hand-historian", title: "Hand Historian", desc: "Finish the poker hands world.", type: "lessons", value: 10 },
  { id: "ten-holds", title: "Ten Correct Holds", desc: "Make 10 correct hold decisions.", type: "holds", value: 10 },
  { id: "fifty-holds", title: "Fifty Correct Holds", desc: "Make 50 correct hold decisions.", type: "holds", value: 50 },
  { id: "mistake-master", title: "Mistake Master", desc: "Review 10 saved mistakes.", type: "reviews", value: 10 },
  { id: "streak-7", title: "Seven-Day Learning Streak", desc: "Practice 7 days in a row.", type: "streak", value: 7 },
  { id: "job-graduate", title: "Jacks or Better Graduate", desc: "Finish the Jacks or Better course.", type: "lessons", value: 13 },
  { id: "academy-first", title: "First Academy Course", desc: "Complete any Academy course.", type: "courses", value: 1 },
];

export default function Achievements() {
  const { isPremium } = useEntitlement();
  const lessonsDone = completionCount();
  // crude earned logic for v1
  const earned = (a) => {
    if (a.type === "lessons") return lessonsDone >= a.value;
    if (a.type === "streak") return false; // tracked in profile
    return false;
  };

  return (
    <div className="px-5 pt-8 pb-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Award size={20} className="hw-gold-text" />
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">Achievements</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Meaningful milestones — never based on betting more or chasing losses.</p>

      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const got = earned(a);
          return (
            <div key={a.id} className={`hw-glass rounded-2xl border p-4 ${got ? "hw-gold-border" : "border-border/60"} ${!got && "opacity-70"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${got ? "hw-chip-gold" : "hw-glass border border-border/60"}`}>
                  {got ? <Award size={18} /> : <Lock size={16} className="text-muted-foreground" />}
                </div>
                {got && <span className="text-[10px] hw-gold-text uppercase tracking-wide">Earned</span>}
              </div>
              <p className="font-semibold text-sm">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}