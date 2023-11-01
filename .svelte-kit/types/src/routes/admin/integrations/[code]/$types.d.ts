import type * as Kit from '@sveltejs/kit';

type RouteParams = { code: string }
type MaybeWithVoid<T> = {} extends T ? T | void : T;
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends { [P in K]: T[K] } ? never : K; }[keyof T];
type OutputDataShape<T> = MaybeWithVoid<Omit<App.PageData, RequiredKeys<T>> & Partial<Pick<App.PageData, keyof T & keyof App.PageData>> & Record<string, any>>
type EnsureParentData<T> = NonNullable<T> extends never ? {} : T;
type PageServerParentData = Omit<Omit<EnsureParentData<import('../../../$types.js').LayoutServerData>, keyof import('../../$types.js').LayoutServerData> & EnsureParentData<import('../../$types.js').LayoutServerData>, keyof LayoutServerData> & EnsureParentData<LayoutServerData>;
type PageParentData = Omit<Omit<EnsureParentData<import('../../../$types.js').LayoutData>, keyof import('../../$types.js').LayoutData> & EnsureParentData<import('../../$types.js').LayoutData>, keyof LayoutData> & EnsureParentData<LayoutData>;
type LayoutParams = RouteParams & { code?: string }
type LayoutParentData = Omit<EnsureParentData<import('../../../$types.js').LayoutData>, keyof import('../../$types.js').LayoutData> & EnsureParentData<import('../../$types.js').LayoutData>;

export type PageServerLoad<OutputData extends OutputDataShape<PageServerParentData> = OutputDataShape<PageServerParentData>> = Kit.ServerLoad<RouteParams, PageServerParentData, OutputData>;
export type PageServerLoadEvent = Parameters<PageServerLoad>[0];
export type Errors = null;
export type PageServerData = Kit.AwaitedProperties<Awaited<ReturnType<typeof import('./proxy+page.server.js').load>>>;
export type PageData = Omit<PageParentData, keyof PageServerData> & PageServerData;
export type Action = Kit.Action<RouteParams>
export type LayoutServerData = null;
export type LayoutData = LayoutParentData;