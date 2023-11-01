// @ts-nocheck
import { prisma } from '$lib/db'
import { type PageServerLoad } from './$types'

export const load = async ({ locals, params }: Parameters<PageServerLoad>[0]) => {
  const { code } = params
  const integration = await prisma.configurationFeature.findUnique({
    where: {
      configurationId_featureCode: {
        configurationId: locals.session.guild,
        featureCode: code.toUpperCase(),
      },
    },
    select: {
      feature: true,
    },
  })
  return {
    configurationId: locals.session.guild,
    integration: integration?.feature,
  }
}
