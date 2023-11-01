// @ts-nocheck
import type { PageServerLoad } from './$types'

export const load = ({ locals }: Parameters<PageServerLoad>[0]) => {
  return {
    isLoggedIn: !!locals.session?.user,
  }
}
