import { ChessKnight, Trophy, Volleyball, type LucideProps } from "lucide-react";

// Outline sport marks for squad cards that have no photo yet. Lucide has no football,
// cricket, badminton, table tennis or basketball icons, so those are drawn here in the
// same style (24px grid, round caps, stroke only) and take the same props.
type IconProps = Omit<LucideProps, "ref">;

function Outline({ children, strokeWidth = 1.5, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

const Football = (props: IconProps) => (
  <Outline {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m12 7.5 4.3 3.1-1.6 5h-5.4l-1.6-5z" />
    <path d="M12 7.5V2.6M16.3 10.6l4.6-1.5M14.7 15.6l2.8 3.9M9.3 15.6l-2.8 3.9M7.7 10.6 3.1 9.1" />
  </Outline>
);

const Cricket = (props: IconProps) => (
  <Outline {...props}>
    <path d="m3.5 20.5 2-2" />
    <path d="m5.5 18.5 9.8-9.8a2 2 0 0 0 0-2.8l-.2-.2a2 2 0 0 0-2.8 0L2.5 15.5l3 3z" />
    <circle cx="18" cy="17" r="3" />
  </Outline>
);

const Badminton = (props: IconProps) => (
  <Outline {...props}>
    <circle cx="6.5" cy="17.5" r="3" />
    <path d="M8.6 15.4 15 3M8.6 15.4 21 9M8.6 15.4l10.6-10.6" />
    <path d="M15 3c3.5.3 5.7 2.5 6 6" />
  </Outline>
);

const TableTennis = (props: IconProps) => (
  <Outline {...props}>
    <circle cx="10" cy="10" r="7" />
    <path d="m15 15 5.5 5.5" />
    <circle cx="19" cy="6" r="2" />
  </Outline>
);

const Basketball = (props: IconProps) => (
  <Outline {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2v20" />
    <path d="M5 4.9a10 10 0 0 1 0 14.2M19 4.9a10 10 0 0 0 0 14.2" />
  </Outline>
);

const ICONS: [RegExp, (props: IconProps) => JSX.Element][] = [
  [/table\s*tennis|ping\s*pong/i, TableTennis],
  [/football|soccer|futsal/i, Football],
  [/cricket/i, Cricket],
  [/badminton/i, Badminton],
  [/basketball/i, Basketball],
  [/volleyball/i, (props) => <Volleyball {...props} />],
  [/chess/i, (props) => <ChessKnight {...props} />],
];

export function SportIcon({ sport, ...props }: IconProps & { sport: string }) {
  const Icon = ICONS.find(([pattern]) => pattern.test(sport))?.[1];
  return Icon ? <Icon {...props} /> : <Trophy {...props} />;
}
