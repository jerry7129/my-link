import { PublicProfileClient } from "./public-profile-client"

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export default async function PublicProfilePage(props: { params: Promise<{ displayName: string }> }) {
  const params = await props.params
  const displayName = params.displayName

  return <PublicProfileClient displayName={displayName} />
}
