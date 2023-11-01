// @ts-nocheck
import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load = async ({ parent }: Parameters<LayoutServerLoad>[0]) => {
  const { session } = await parent()
  if (
    session?.user?.isAdmin ||
    session?.user?.isStaff ||
    session?.user?.isGuildOwner
  ) {
    return {}
  }
  throw redirect(302, '/restricted')
}
