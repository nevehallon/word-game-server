import { type Application } from "express";

import { useCompression } from './compression';
import { useCors } from './cors';
import helmet from "helmet";

export function useMiddleWares(app: Application) {
	app.use(helmet());
	app.use(useCompression());
	app.use(useCors());
	return app;
}