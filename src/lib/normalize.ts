export function normalizeAnswer(raw: string): string {
  return (raw || "").toUpperCase().replace(/[^A-Z]/g, "");
}

export function normalizeEmployeeId(raw: string): string {
  return (raw || "").trim().toUpperCase().replace(/\s+/g, "");
}

export function maskEmployeeId(raw: string): string {
  const s = (raw || "").trim();
  if (s.length <= 2) return "****";
  return "****" + s.slice(-2);
}

export function validateName(name: string): string | null {
  const trimmed = (name || "").trim();
  if (trimmed.length < 3) return "Name must be at least 3 characters.";
  if (!/^[A-Za-zÀ-ÿ'\-\s]+$/.test(trimmed)) return "Name contains invalid characters.";
  return null;
}

export function validateEmployeeId(id: string): string | null {
  const trimmed = (id || "").trim();
  if (!trimmed) return "Employee ID is required.";
  if (!/^[A-Za-z0-9\-]+$/.test(trimmed)) return "Employee ID contains invalid characters.";
  if (trimmed.length < 3 || trimmed.length > 32) return "Employee ID must be 3–32 characters.";
  return null;
}

export function firstName(fullName: string): string {
  return (fullName || "").trim().split(/\s+/)[0] || "Player";
}