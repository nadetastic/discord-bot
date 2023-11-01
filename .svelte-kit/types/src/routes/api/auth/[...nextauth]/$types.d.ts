import type * as Kit from '@sveltejs/kit';

type RouteParams = { nextauth: string }

export type RequestHandler = Kit.RequestHandler<RouteParams>;
export type RequestEvent = Kit.RequestEvent<RouteParams>;