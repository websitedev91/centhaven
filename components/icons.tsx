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
