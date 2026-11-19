import type { ReactNode, SVGProps } from 'react';

/**
 * Inline SVG icons (DESIGN.md §5): 20px, 1.75px stroke, currentColor. No icon library.
 * Decorative by default (aria-hidden); pass `title` only when the icon carries meaning alone.
 */
type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number; title?: string };

function Icon({ size = 20, title, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const LinkIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8.5 11.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5l-1 1" />
    <path d="M11.5 8.5a3.5 3.5 0 0 0-5 0L4 11a3.5 3.5 0 0 0 5 5l1-1" />
  </Icon>
);

export const PrintIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5.5 7.5V3h9v4.5" />
    <rect x="2.5" y="7.5" width="15" height="7" rx="1.5" />
    <path d="M5.5 12.5h9V17h-9z" />
  </Icon>
);

export const CodeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m7 6-4 4 4 4M13 6l4 4-4 4" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m4 10.5 4 4 8-9" />
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9" cy="9" r="5.5" />
    <path d="m13.5 13.5 3.5 3.5" />
  </Icon>
);

export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6h14M3 10h14M3 14h14" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5 5 10 10M15 5 5 15" />
  </Icon>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5.5 8 4.5 4.5L14.5 8" />
  </Icon>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m8 5.5 4.5 4.5L8 14.5" />
  </Icon>
);

export const ResetIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 10a6 6 0 1 0 1.8-4.3L4 7.5" />
    <path d="M4 3.5v4h4" />
  </Icon>
);

/** Plus that becomes a minus: the vertical bar rotates flat when the parent `group` is open. */
export const PlusMinusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 10h12" />
    <path d="M10 4v12" className="origin-center transition-transform duration-200 group-open:rotate-90" />
  </Icon>
);

/* Category and trust icons (homepage). Same 20px grid and 1.75 stroke as the rest. */
export const BriefcaseIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.5" y="6" width="15" height="10.5" rx="2" />
    <path d="M7 6V4.5A1.5 1.5 0 0 1 8.5 3h3A1.5 1.5 0 0 1 13 4.5V6M2.5 10.5h15" />
  </Icon>
);

export const WalletIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15.5 6.5V5a1.5 1.5 0 0 0-1.5-1.5H4.5A2 2 0 0 0 2.5 5.5v9a2 2 0 0 0 2 2h11a1.5 1.5 0 0 0 1.5-1.5V8A1.5 1.5 0 0 0 15.5 6.5H4.5" />
    <circle cx="13.5" cy="11.5" r="1" />
  </Icon>
);

export const BarChartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 16.5h14M5.5 13.5v-3M10 13.5V6M14.5 13.5v-6" />
  </Icon>
);

export const MegaphoneIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 8v4a1 1 0 0 0 1 1h2l6 3.5v-13L6 7H4a1 1 0 0 0-1 1ZM6 13l1 4M15 7.5a3.5 3.5 0 0 1 0 5" />
  </Icon>
);

export const ShieldIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 2.5 4 5v4.5c0 3.8 2.5 6.6 6 8 3.5-1.4 6-4.2 6-8V5l-6-2.5Z" />
  </Icon>
);

export const CheckCircleIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="7.5" />
    <path d="m6.8 10.2 2.2 2.2 4.2-4.6" />
  </Icon>
);

export const BookIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3H9v13.5H4.5A1.5 1.5 0 0 1 3 15V4.5ZM17 4.5A1.5 1.5 0 0 0 15.5 3H11v13.5h4.5A1.5 1.5 0 0 0 17 15V4.5Z" />
  </Icon>
);

export const FlaskIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 2.5h4M8.5 2.5v5L4 15.2A1.5 1.5 0 0 0 5.3 17.5h9.4a1.5 1.5 0 0 0 1.3-2.3L11.5 7.5v-5M6 12.5h8" />
  </Icon>
);

export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4" width="14" height="13" rx="2" />
    <path d="M3 8h14M7 2.5v3M13 2.5v3" />
  </Icon>
);

export const UserCheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="8" cy="6.5" r="3" />
    <path d="M2.5 17c0-3 2.5-5 5.5-5s4 1 4.8 2M12.5 15l1.8 1.8 3.2-3.6" />
  </Icon>
);

export const DownloadIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 3v9.5M6 8.5l4 4 4-4M3.5 13.5v2A1.5 1.5 0 0 0 5 17h10a1.5 1.5 0 0 0 1.5-1.5v-2" />
  </Icon>
);

export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 4v12M4 10h12" />
  </Icon>
);

export const TrashIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 5.5h13M8 5.5V4h4v1.5M5.5 5.5l.75 10.5h7.5l.75-10.5M8.5 8.5v5M11.5 8.5v5" />
  </Icon>
);

export const ArrowUpIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 16V4M5 9l5-5 5 5" />
  </Icon>
);

export const ArrowDownIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 4v12M5 11l5 5 5-5" />
  </Icon>
);

export const FileIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M11.5 3H6a1.5 1.5 0 0 0-1.5 1.5v11A1.5 1.5 0 0 0 6 17h8a1.5 1.5 0 0 0 1.5-1.5V7z" />
    <path d="M11.5 3v4h4" />
  </Icon>
);
