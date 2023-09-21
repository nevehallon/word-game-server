
import cors from 'cors';
const corsOptions = {
	origin: process.env.BASE_URL || 'https://nevehallon.github.io',
	optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
export const useCors = () => cors(corsOptions);