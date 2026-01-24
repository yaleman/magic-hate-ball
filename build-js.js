import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { build } from "esbuild";

const sourceDir = "js";
const outDir = "magic_hate_ball/static/js";

function getOutfilePath(filepath) {
	const relPath = relative(sourceDir, filepath);
	const outPath = join(outDir, relPath);
	if (outPath.endsWith(".ts")) {
		return outPath.replace(/\.ts$/, ".js");
	}
	return outPath;
}

async function buildfile(filepath) {
	const outfile = getOutfilePath(filepath);
	console.log(
		`Building ${filepath}... to ${outfile}`,
	);
	try {
		await build({
			entryPoints: [filepath],
			bundle: true,
			format: "esm",
			platform: "browser",
			// Output .js files regardless of input extension
			outfile,
			minify: true,
			sourcemap: false,
			external: [],
		});
	} catch (err) {
		console.error(err);
		throw new Error("Build process failed");
	}
}

const files = readdirSync(sourceDir);
const buildPromises = [];
for (const file of files) {
	const filepath = join(sourceDir, file);
	// Process both .js and .ts files
	if (!file.endsWith(".js") && !file.endsWith(".ts")) continue;

	buildPromises.push(buildfile(filepath));
}

await Promise.all(buildPromises);

console.log("Javascript bundle created successfully");
