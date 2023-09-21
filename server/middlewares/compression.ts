import compression, { type CompressionFilter } from "compression";



const shouldCompress: CompressionFilter = (req, res) => {
	if (req.headers['x-no-compression']) {
		// don't compress responses with this request header
		return false;
	}
	// fallback to standard filter function

	return compression.filter(req, res);
}

export const useCompression = () => compression({
	level: 6,
	filter: shouldCompress
})
