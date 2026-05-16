import { PublicProfileClient } from "./public-profile-client"

export default async function PublicProfilePage(props: { params: Promise<{ displayName: string }> }) {
  const params = await props.params
  const displayName = params.displayName

  return <PublicProfileClient displayName={displayName} />
}
