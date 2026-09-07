export function getGithubUsername(user) {
  if (!user) {
    return "";
  }

  const metadata = user.user_metadata ?? {};
  const githubIdentity = user.identities?.find(
    (identity) => identity.provider === "github"
  );
  const identityData = githubIdentity?.identity_data ?? {};

  return (
    metadata.user_name ||
    metadata.preferred_username ||
    metadata.login ||
    identityData.user_name ||
    identityData.preferred_username ||
    identityData.login ||
    user.email?.split("@")[0] ||
    ""
  );
}
