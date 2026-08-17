import { forwardRef, type ComponentType, type ReactNode } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { IllustrationType, IllustrationsProps } from "./Illustrations.types";

export const Illustrations = forwardRef<HTMLDivElement, IllustrationsProps>(
  ({ type = "noResults", size = "md", description, className, ...rest }, ref) => {
    const Illustration = illustrationComponents[type];

    return (
      <div
        ref={ref}
        className={twMerge("flex h-full w-full items-center justify-center", className)}
        {...rest}
      >
        <div className="flex flex-col items-center gap-4">
          <div className={illustrationSizeVariants({ size })}>
            <Illustration />
          </div>
          {description ? (
            <div className={illustrationDescriptionVariants({ size })}>{description}</div>
          ) : null}
        </div>
      </div>
    );
  },
);

Illustrations.displayName = "Illustrations";

const illustrationComponents: Record<IllustrationType, ComponentType> = {
  list: ListIllustration,
  noResults: NoResultsIllustration,
  error: ErrorIllustration,
  network: NetworkIllustration,
  permission: PermissionIllustration,
  file: FileIllustration,
  notification: NotificationIllustration,
  message: MessageIllustration,
  calendar: CalendarIllustration,
  chart: ChartIllustration,
  comingSoon: ComingSoonIllustration,
  completed: CompletedIllustration,
};

function IllustrationCanvas({ children }: { children: ReactNode }) {
  return (
    <svg className="size-full" viewBox="0 0 128 128" fill="none">
      <rect width="128" height="128" rx="20" fill="#F5F5F5" />
      {children}
    </svg>
  );
}

function ListIllustration() {
  return (
    <IllustrationCanvas>
      <rect x="30" y="22" width="68" height="84" rx="10" fill="white" />
      <rect x="41" y="40" width="7" height="7" rx="2" fill="#CDD5E0" />
      <rect x="54" y="41" width="33" height="5" rx="2.5" fill="#CDD5E0" />
      <rect x="41" y="57" width="7" height="7" rx="2" fill="#CDD5E0" />
      <rect x="54" y="58" width="33" height="5" rx="2.5" fill="#CDD5E0" />
      <rect x="41" y="74" width="7" height="7" rx="2" fill="#CDD5E0" />
      <rect x="54" y="75" width="25" height="5" rx="2.5" fill="#CDD5E0" />
    </IllustrationCanvas>
  );
}

function NoResultsIllustration() {
  return (
    <IllustrationCanvas>
      <rect x="33" y="24" width="62" height="78" rx="10" fill="white" />
      <circle cx="51" cy="48" r="3" fill="#97A3B6" />
      <circle cx="64" cy="48" r="3" fill="#97A3B6" />
      <circle cx="77" cy="48" r="3" fill="#97A3B6" />
      <circle cx="81" cy="81" r="18" fill="#CDD5E0" />
      <circle cx="81" cy="81" r="12" fill="#E3E8EF" />
      <path d="M94 94L104 104" stroke="#97A3B6" strokeWidth="6" strokeLinecap="round" />
      <circle cx="75" cy="76" r="2" fill="white" />
    </IllustrationCanvas>
  );
}

function ErrorIllustration() {
  return (
    <IllustrationCanvas>
      <rect x="32" y="24" width="64" height="80" rx="10" fill="white" />
      <circle cx="64" cy="64" r="24" fill="#FBD5D5" />
      <path d="M64 50V68" stroke="#E02424" strokeWidth="6" strokeLinecap="round" />
      <circle cx="64" cy="79" r="3" fill="#E02424" />
    </IllustrationCanvas>
  );
}

function NetworkIllustration() {
  return (
    <IllustrationCanvas>
      <rect x="24" y="28" width="80" height="72" rx="12" fill="white" />
      <path d="M39 60C53 47 75 47 89 60" stroke="#CDD5E0" strokeWidth="7" strokeLinecap="round" />
      <path d="M49 72C57 64 71 64 79 72" stroke="#97A3B6" strokeWidth="7" strokeLinecap="round" />
      <circle cx="64" cy="84" r="5" fill="#97A3B6" />
      <path d="M40 39L91 90" stroke="#F05252" strokeWidth="6" strokeLinecap="round" />
    </IllustrationCanvas>
  );
}

function PermissionIllustration() {
  return (
    <IllustrationCanvas>
      <rect x="28" y="30" width="72" height="70" rx="12" fill="white" />
      <path
        d="M48 60V52C48 43.2 55.2 36 64 36C72.8 36 80 43.2 80 52V60"
        stroke="#97A3B6"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <rect x="43" y="57" width="42" height="34" rx="9" fill="#C3DDFD" />
      <circle cx="64" cy="72" r="5" fill="#3F83F8" />
      <path d="M64 76V82" stroke="#3F83F8" strokeWidth="4" strokeLinecap="round" />
    </IllustrationCanvas>
  );
}

function FileIllustration() {
  return (
    <IllustrationCanvas>
      <path
        d="M24 45C24 39.5 28.5 35 34 35H56L64 44H94C99.5 44 104 48.5 104 54V94H24V45Z"
        fill="#CDD5E0"
      />
      <path
        d="M24 58H104V91C104 97.1 99.1 102 93 102H35C28.9 102 24 97.1 24 91V58Z"
        fill="#E3E8EF"
      />
      <rect x="44" y="25" width="46" height="58" rx="8" fill="white" />
      <rect x="53" y="43" width="28" height="5" rx="2.5" fill="#CDD5E0" />
      <rect x="53" y="55" width="21" height="5" rx="2.5" fill="#CDD5E0" />
    </IllustrationCanvas>
  );
}

function NotificationIllustration() {
  return (
    <IllustrationCanvas>
      <rect x="26" y="24" width="76" height="80" rx="12" fill="white" />
      <path
        d="M42 77H86L81 69V57C81 47.6 73.4 40 64 40C54.6 40 47 47.6 47 57V69L42 77Z"
        fill="#C3DDFD"
      />
      <path
        d="M58 83C59.5 88.5 68.5 88.5 70 83"
        stroke="#3F83F8"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="84" cy="42" r="9" fill="#F98080" />
    </IllustrationCanvas>
  );
}

function MessageIllustration() {
  return (
    <IllustrationCanvas>
      <path
        d="M24 38C24 31.4 29.4 26 36 26H92C98.6 26 104 31.4 104 38V76C104 82.6 98.6 88 92 88H60L42 102V88H36C29.4 88 24 82.6 24 76V38Z"
        fill="white"
      />
      <circle cx="48" cy="58" r="5" fill="#CDD5E0" />
      <circle cx="64" cy="58" r="5" fill="#97A3B6" />
      <circle cx="80" cy="58" r="5" fill="#CDD5E0" />
    </IllustrationCanvas>
  );
}

function CalendarIllustration() {
  return (
    <IllustrationCanvas>
      <rect x="27" y="29" width="74" height="74" rx="12" fill="white" />
      <path d="M27 49H101V41C101 34.4 95.6 29 89 29H39C32.4 29 27 34.4 27 41V49Z" fill="#C3DDFD" />
      <path d="M45 22V36M83 22V36" stroke="#3F83F8" strokeWidth="6" strokeLinecap="round" />
      <rect x="42" y="63" width="10" height="10" rx="3" fill="#CDD5E0" />
      <rect x="59" y="63" width="10" height="10" rx="3" fill="#97A3B6" />
      <rect x="76" y="63" width="10" height="10" rx="3" fill="#CDD5E0" />
      <rect x="42" y="80" width="10" height="10" rx="3" fill="#CDD5E0" />
      <rect x="59" y="80" width="10" height="10" rx="3" fill="#CDD5E0" />
    </IllustrationCanvas>
  );
}

function ChartIllustration() {
  return (
    <IllustrationCanvas>
      <rect x="25" y="25" width="78" height="78" rx="12" fill="white" />
      <path d="M42 86V70" stroke="#CDD5E0" strokeWidth="12" strokeLinecap="round" />
      <path d="M64 86V57" stroke="#76A9FA" strokeWidth="12" strokeLinecap="round" />
      <path d="M86 86V43" stroke="#A4CAFE" strokeWidth="12" strokeLinecap="round" />
      <path
        d="M38 43L53 49L68 38L88 32"
        stroke="#97A3B6"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IllustrationCanvas>
  );
}

function ComingSoonIllustration() {
  return (
    <IllustrationCanvas>
      <rect x="25" y="25" width="78" height="78" rx="12" fill="white" />
      <circle cx="64" cy="66" r="25" fill="#DCD7FE" />
      <path
        d="M64 51V67L75 75"
        stroke="#9061F9"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M91 32V42M86 37H96" stroke="#AC94FA" strokeWidth="4" strokeLinecap="round" />
      <path d="M35 37V45M31 41H39" stroke="#CABFFD" strokeWidth="3" strokeLinecap="round" />
    </IllustrationCanvas>
  );
}

function CompletedIllustration() {
  return (
    <IllustrationCanvas>
      <rect x="26" y="24" width="76" height="80" rx="12" fill="white" />
      <circle cx="64" cy="64" r="27" fill="#BCF0DA" />
      <path
        d="M49 64L59 74L80 53"
        stroke="#0E9F6E"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="91" cy="37" r="4" fill="#84E1BC" />
      <circle cx="37" cy="89" r="4" fill="#84E1BC" />
    </IllustrationCanvas>
  );
}

const illustrationSizeVariants = cva("shrink-0", {
  variants: {
    size: {
      sm: "size-16",
      md: "size-24",
      lg: "size-32",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const illustrationDescriptionVariants = cva(
  "text-center font-pretendard font-medium whitespace-pre-line text-[#677589]",
  {
    variants: {
      size: {
        sm: "text-sm leading-5",
        md: "text-[15px] leading-6",
        lg: "text-base leading-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);
