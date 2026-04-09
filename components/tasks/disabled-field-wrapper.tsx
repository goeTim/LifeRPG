import { ReactNode } from "react";

type DisabledFieldWrapperProps = {
  enabled: boolean;
  children: ReactNode;
};

export function DisabledFieldWrapper({ enabled, children }: DisabledFieldWrapperProps) {
  return (
    <fieldset disabled={!enabled} className={!enabled ? "pointer-events-none opacity-50" : ""}>
      {children}
    </fieldset>
  );
}
