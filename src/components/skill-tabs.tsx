import { SKILLS } from "@/lib/employly";

export function SkillTabs({
  selected,
  onToggle,
  onClear,
}: {
  selected: string[];
  onToggle: (skill: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1">
      <div className="flex w-max gap-2">
        <button
          type="button"
          onClick={onClear}
          className={
            "whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium transition-colors " +
            (selected.length === 0
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground")
          }
        >
          All
        </button>
        {SKILLS.map((skill) => {
          const active = selected.includes(skill);
          return (
            <button
              key={skill}
              type="button"
              onClick={() => onToggle(skill)}
              aria-pressed={active}
              className={
                "whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium transition-colors " +
                (active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground")
              }
            >
              {skill}
            </button>
          );
        })}
      </div>
    </div>
  );
}
