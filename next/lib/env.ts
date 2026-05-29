export function isDevBuild() {
  return (
    process.env.APP_ENV === "development" ||
    process.env.NODE_ENV === "development"
  );
}
