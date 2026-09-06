import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

type Props = { value: number; onChange: (v: number) => void; className?: string; placeholder?: string };

// Controlled input that allows typing intermediate decimal values (e.g. "32.") without
// resetting, and accepts comma as decimal separator (Hungarian locale).
export function DecimalInput({ value, onChange, className, placeholder }: Props) {
  const [str, setStr] = useState(value === 0 ? "" : String(value));

  useEffect(() => {
    const parsed = parseFloat(str.replace(",", "."));
    if (parsed !== value) {
      setStr(value === 0 ? "" : String(value));
    }
  }, [value]);

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={str}
      onChange={(e) => {
        const raw = e.target.value;
        setStr(raw);
        const num = parseFloat(raw.replace(",", "."));
        if (!isNaN(num)) onChange(num);
        else if (raw === "") onChange(0);
      }}
      className={className}
      placeholder={placeholder ?? "0"}
    />
  );
}
