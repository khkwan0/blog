export function displayUsername(username: string) {
  return username.startsWith("@") ? username : `@${username}`;
}
