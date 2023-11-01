import type * as Kit from '@sveltejs/kit';

type RouteParams = { username: string }

export type RequestHandler = Kit.RequestHandler<RouteParams>;
export type RequestEvent = Kit.RequestEvent<RouteParams>;