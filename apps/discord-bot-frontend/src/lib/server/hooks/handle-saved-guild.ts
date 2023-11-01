import cookie from 'cookie'
import { Routes } from 'discord.js'
import { GUILD_COOKIE } from '$lib/constants'
import { api } from '$lib/discord/api'
import { getBotGuilds } from '$lib/discord/get-bot-guilds'
import type { Handle, RequestEvent } from '@sveltejs/kit'

/**
 * Parse cookies from the event and returns the value of the guild cookie
 */
function useSavedGuild(
  event: RequestEvent<Partial<Record<string, string>>, string | null>
) {
  const cookies = event.request.headers.get('cookie')
  if (cookies) {
    const parsed = cookie.parse(cookies)
    return parsed[GUILD_COOKIE]
  }
  return null
}

export const handleSavedGuild: Handle = async ({ event, resolve }) => {
  const savedGuild = useSavedGuild(event)

  console.log('IN HANLDE S GUILD')

  /** Guilds that are shared between the current user and bot */
  const sharedGuilds = []

  console.log('============',savedGuild)
  console.log('============',event.locals.session?.user)



  // only attempt to fetch guild memberships if the user is logged in
  if (savedGuild && event.locals.session?.user) {
    console.log('============',savedGuild)
    const botGuilds = await getBotGuilds()
    console.log('hmmm')
    for (const guild of botGuilds) {
      try {
        await api.get(
          Routes.guildMember(guild.id, event.locals.session.user.discordUserId)
        )
        console.log('++++')
        sharedGuilds.push(guild)
      } catch (error) {
        // user is not a member of this guild, this messaging can be safely ignored but is available for debugging
        console.log('=>>>',error)
        console.warn(
          `[ignore] Error fetching guild member ${event.locals.session.user.discordUserId} for ${guild.id}: ${error}`
        )
      }
    }
  }

  // resolve the "active" guild and fallback to the default if not found
  const activeGuild =
    sharedGuilds.find((g) => g.id === savedGuild)?.id ??
    import.meta.env.VITE_DISCORD_GUILD_ID

  // set guild on locals
  event.locals.guildId = activeGuild
  event.locals.guilds = sharedGuilds

  // resolve the request
  const response = await resolve(event)

  // refresh the cookie
  response.headers.append(
    'Set-Cookie',
    cookie.serialize(GUILD_COOKIE, activeGuild, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
    })
  )

  // console.log(response)

  console.log('returning response')
  return response
}
