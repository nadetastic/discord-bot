// @ts-nocheck
import type { PageLoad } from './$types'

export const load = ({ url }: Parameters<PageLoad>[0]) => {
  return {
    title: `Error`,
  }
}
