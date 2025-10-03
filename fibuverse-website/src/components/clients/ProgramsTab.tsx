"use client";

interface ProgramsTabProps {
  clientName: string;
  clientGender?: string | null;
  clientAge?: number | null;
}

export default function ProgramsTab({ clientName, clientGender, clientAge }: ProgramsTabProps) {
  return (
    <div className="p-4 text-gray-400">
      Programs Tab for {clientName}, {clientGender}, {clientAge}- content coming soon.
    </div>
  );
}