// ClientCalendarTab.tsx

interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  city?: string | null;
  home_state?: string | null;
  country?: string | null;
  profile_image?: string | null;
  gender?: string | null;
  height?: number | null;
  body_weight?: number | null;
  age?: number | null;
}

export default function ClientCalendarTab({ client }: { client: Client }) {
  return <div>Monthly calendar for {client?.first_name}</div>;
}