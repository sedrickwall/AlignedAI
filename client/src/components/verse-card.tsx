import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface VerseCardProps {
  text: string;
  reference: string;
}

export function VerseCard({ text, reference }: VerseCardProps) {
  return (
    <Card className="shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Verse of the Day
          </p>
        </div>
        <blockquote 
          className="italic text-sm text-foreground leading-relaxed"
          data-testid="text-verse-content"
        >
          "{text}"
        </blockquote>
        <p 
          className="text-xs text-muted-foreground mt-2"
          data-testid="text-verse-reference"
        >
          — {reference}
        </p>
      </CardContent>
    </Card>
  );
}
