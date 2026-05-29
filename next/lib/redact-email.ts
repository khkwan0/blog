export function redactEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) {
    return "***";
  }

  const redactedLocal =
    local.length === 1 ? local : `${local[0]}${"*".repeat(3)}`;

  return `${redactedLocal}@${domain}`;
}
