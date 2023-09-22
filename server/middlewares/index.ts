import { type Application } from "express";

import { useCompression } from './compression';
import { useCors } from './cors';
import helmet from "helmet";
import router from "#routes";

export function useMiddleWares(app: Application) {
	app.use(helmet());
	app.use(useCompression());
	app.use(useCors());
	app.use(router)
	return app;
}