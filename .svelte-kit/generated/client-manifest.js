export { matchers } from './client-matchers.js';

export const nodes = [() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16')];

export const server_loads = [0,2,5];

export const dictionary = {
	"": [6],
	"admin": [~7,[2]],
	"dashboard": [~11,[5]],
	"logout": [~12],
	"questions": [~14],
	"restricted": [16],
	"admin/integrations": [~8,[2]],
	"auth/error": [10],
	"profile/link": [13],
	"admin/integrations/[code]": [~9,[2,3]],
	"questions/[id]": [~15]
};