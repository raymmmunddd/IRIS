import { useCallback, useState } from "react";

export function useToggle(initial = false) {
  const [value, setValue] = useState<boolean>(initial);

  const toggle = useCallback(() => setValue((prev) => !prev), []);
  const setOn = useCallback(() => setValue(true), []);
  const setOff = useCallback(() => setValue(false), []);

  return { value, toggle, setOn, setOff } as const;
}
