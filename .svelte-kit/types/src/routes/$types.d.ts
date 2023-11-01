import type * as Kit from '@sveltejs/kit';

type RouteParams = {  }
type MaybeWithVoid<T> = {} extends T ? T | void : T;
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends { [P in K]: T[K] } ? never : K; }[keyof T];
type OutputDataShape<T> = MaybeWithVoid<Omit<App.PageData, RequiredKeys<T>> & Partial<Pick<App.PageData, keyof T & keyof App.PageData>> & Record<string, any>>
type EnsureParentData<T> = NonNullable<T> extends never ? {} : T;
type PageParentData = EnsureParentData<LayoutData>;
type LayoutParams = RouteParams & { code?: string,id?: string }
type LayoutServerParentData = EnsureParentData<{}>;
type LayoutParentData = EnsureParentData<{}>;

export type PageServerData = null;
export type PageData = PageParentData;
export type LayoutServerLoad<OutputData extends OutputDataShape<LayoutServerParentData> = OutputDataShape<LayoutServerParentData>> = Kit.ServerLoad<LayoutParams, LayoutServerParentData, OutputData>;
export type LayoutServerLoadEvent = Parameters<LayoutServerLoad>[0];
export type LayoutServerData = Kit.AwaitedProperties<Awaited<ReturnType<typeof import('./proxy+layout.server.js').load>>>;
export type LayoutData = Omit<LayoutParentData, keyof LayoutServerData> & LayoutServerData;