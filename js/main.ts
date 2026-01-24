import { drawScene } from "./draw-scene";
import { initBuffers } from "./init-buffers";
import type { ProgramInfo } from "./programinfo";

type TextTextureInfo = {
	texture: WebGLTexture;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	needsUpdate: boolean;
};

type Rotation = {
	x: number;
	y: number;
	z: number;
};

let answers: string[] = [];
let textTextureInfo: TextTextureInfo | null = null;
let currentRotation: Rotation = { x: 0, y: 0, z: 0 };
let startRotation: Rotation = { x: 0, y: 0, z: 0 };
const targetRotation: Rotation = { x: 0, y: 0, z: 0 };
let settleStartMs: number | null = null;
const settleDurationMs = 1000;

/// gets a batch of answers from the backend API
// Fetch the latest answer list from the backend.
async function getAnswers(): Promise<string[]> {
	try {
		const response = await fetch("/answers");

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		return data.answers || [];
	} catch (error) {
		console.error("Failed to fetch answers:", error);
		throw error;
	}
}

// Wrap a string into multiple lines based on a max pixel width.
function wrapText(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number,
): string[] {
	const words = text.split(/\s+/).filter(Boolean);
	const lines: string[] = [];
	let line = "";
	for (const word of words) {
		const testLine = line ? `${line} ${word}` : word;
		if (ctx.measureText(testLine).width > maxWidth && line) {
			lines.push(line);
			line = word;
		} else {
			line = testLine;
		}
	}
	if (line) {
		lines.push(line);
	}
	return lines.length ? lines : [text];
}

// Set up WebGL, build buffers/textures, and drive the render loop.
function renderLoop(): void {
	const canvas = document.getElementById(
		"hate-ball-canvas",
	) as HTMLCanvasElement;
	if (!canvas) {
		showError("Canvas element not found.");
		return;
	}

	const gl = canvas.getContext("webgl");

	if (!gl || gl === null) {
		showError("Failed to get rendering context this is a bug :(");
		return;
	}
	// Set clear color to white, fully opaque
	gl.clearColor(1.0, 1.0, 1.0, 1.0);

	// Clear the color buffer with specified clear color
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Vertex shader program
	const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;
        attribute vec2 aTextureCoord;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying lowp vec4 vColor;
        varying highp vec2 vTextureCoord;

        void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
        vTextureCoord = aTextureCoord;
        }
    `;

	// Fragment shader program
	const fsSource = `
        varying lowp vec4 vColor;
        varying highp vec2 vTextureCoord;
        uniform sampler2D uSampler;

        void main(void) {
        gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;
        }
    `;

	// Initialize a shader program; this is where all the lighting
	// for the vertices and so forth is established.
	const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
	if (!shaderProgram) {
		throw Error("Shader program failed to initialize.");
	}

	// Collect all the info needed to use the shader program.
	// Look up which attributes our shader program is using
	// for aVertexPosition, aVertexColor and also
	// look up uniform locations.

	const programInfo: ProgramInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
			vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
			textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(
				shaderProgram,
				"uProjectionMatrix",
			),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
			uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
		},
	};

	// Here's where we call the routine that builds all the
	// objects we'll be drawing.
	const buffers = initBuffers(gl);
	textTextureInfo = initTextTexture(gl);
	updateTextTexture(gl, textTextureInfo, answers);
	randomizeRotation();

	// Draw the scene repeatedly
	function render(now: number, gl: WebGLRenderingContext) {
		updateRotation(now);

		if (textTextureInfo?.needsUpdate) {
			uploadTextTexture(gl, textTextureInfo);
		}
		drawScene(
			gl,
			programInfo,
			buffers,
			textTextureInfo?.texture ?? null,
			currentRotation,
		);

		window.requestAnimationFrame((now) => render(now, gl));
	}
	window.requestAnimationFrame((now) => render(now, gl));
}

// Show an error message in the UI.
async function showError(message: string) {
	console.error(message);
	const errorDiv = document.getElementById("error");
	if (errorDiv) {
		errorDiv.textContent = message;
		errorDiv.classList.remove("hidden");
	}
}

// Fetch answers, update the UI, and refresh the texture.
async function displayAnswer() {
	const errorDiv = document.getElementById("error");
	try {
		const answerResponse = await getAnswers();
		if (!answerResponse.length) {
			showError("No answers received from the server.");
		} else {
			console.debug(`Received answers: ${answerResponse.join(" | ")}`);
			answers = answerResponse;
			const canvas = document.getElementById(
				"hate-ball-canvas",
			) as HTMLCanvasElement | null;
			const gl = canvas?.getContext("webgl");
			if (gl && textTextureInfo) {
				updateTextTexture(gl, textTextureInfo, answers);
			}
			randomizeRotation();
			if (errorDiv) {
				errorDiv.classList.add("hidden");
			}
		}
	} catch (error) {
		showError(`Error fetching answer: ${error}`);
	}
}

// Start a new randomized rotation that eases back to front-facing.
function randomizeRotation() {
	startRotation = {
		x: Math.random() * Math.PI * 2,
		y: Math.random() * Math.PI * 2,
		z: Math.random() * Math.PI * 2,
	};
	currentRotation = { ...startRotation };
	settleStartMs = performance.now();
}

// Update the cube rotation based on the current settle animation.
function updateRotation(nowMs: number) {
	if (settleStartMs === null) {
		return;
	}
	const t = (nowMs - settleStartMs) / settleDurationMs;
	if (t >= 1) {
		currentRotation = { ...targetRotation };
		settleStartMs = null;
		return;
	}
	const eased = 1 - (1 - t) ** 3;
	currentRotation = {
		x: lerp(startRotation.x, targetRotation.x, eased),
		y: lerp(startRotation.y, targetRotation.y, eased),
		z: lerp(startRotation.z, targetRotation.z, eased),
	};
}

// Linear interpolation helper.
function lerp(start: number, end: number, t: number) {
	return start + (end - start) * t;
}

// Create a canvas-backed texture and initialize WebGL parameters.
function initTextTexture(gl: WebGLRenderingContext): TextTextureInfo {
	const canvas = document.createElement("canvas");
	canvas.width = 768;
	canvas.height = 512;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("Unable to create 2D context for text texture");
	}

	const texture = gl.createTexture();
	if (!texture) {
		throw new Error("Unable to create WebGL texture");
	}
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		canvas.width,
		canvas.height,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		null,
	);

	return {
		texture,
		canvas,
		ctx,
		needsUpdate: true,
	};
}

// Draw answer text into the atlas and schedule a texture upload.
function updateTextTexture(
	gl: WebGLRenderingContext,
	textureInfo: TextTextureInfo,
	texts: string[],
) {
	const { canvas, ctx } = textureInfo;
	const columns = 3;
	const rows = 2;
	const cellWidth = canvas.width / columns;
	const cellHeight = canvas.height / rows;
	const padding = 20;

	const colourBlack = "#111111";
	const colourWhite = "#ffffff";
	const colourRed = "#d64b4b";
	const colourGreen = "#45b86f";
	const colourBlue = "#1253ae";
	const colourYellow = "#e0c24d";
	const colourPurple = "#4b0067";
	const faceColors = [
		colourBlack,
		colourRed,
		colourGreen,
		colourBlue,
		colourYellow,
		colourPurple,
	];
	// randomize the colours
	faceColors.sort(() => Math.random() - 0.5);
	const faceTexts = texts.length ? texts : ["..."];

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = "bold 22px sans-serif";

	for (let i = 0; i < columns * rows; i += 1) {
		const col = i % columns;
		const row = Math.floor(i / columns);
		const x = col * cellWidth;
		const y = row * cellHeight;
		ctx.fillStyle = faceColors[i % faceColors.length];
		ctx.fillRect(x, y, cellWidth, cellHeight);

		const text = faceTexts[i % faceTexts.length];
		const maxWidth = cellWidth - padding * 2;
		if ([colourYellow, colourGreen].includes(ctx.fillStyle)) {
			ctx.fillStyle = colourBlack;
		} else {
			ctx.fillStyle = colourWhite;
		}
		const lines = wrapText(ctx, text, maxWidth);
		const lineHeight = 26;
		const centerX = x + cellWidth / 2;
		const centerY = y + cellHeight / 2;
		const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
		for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
			ctx.fillText(lines[lineIndex], centerX, startY + lineIndex * lineHeight);
		}
	}

	textureInfo.needsUpdate = true;
	uploadTextTexture(gl, textureInfo);
}

// Upload the canvas contents into the WebGL texture.
function uploadTextTexture(
	gl: WebGLRenderingContext,
	textureInfo: TextTextureInfo,
) {
	gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		textureInfo.canvas,
	);
	textureInfo.needsUpdate = false;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
// Compile and link the vertex/fragment shaders into a program.
function initShaderProgram(
	gl: WebGLRenderingContext,
	vsSource: string,
	fsSource: string,
) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
	if (!vertexShader || !fragmentShader) {
		throw new Error("Shader creation failed");
	}
	// Create the shader program

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert(
			`Unable to initialize the shader program: ${gl.getProgramInfoLog(
				shaderProgram,
			)}`,
		);
		return null;
	}

	return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
// Create and compile a single shader.
function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
	const shader = gl.createShader(type);
	if (!shader) {
		throw new Error("Unable to create shader");
	}
	// Send the source to the shader object

	gl.shaderSource(shader, source);

	// Compile the shader program

	gl.compileShader(shader);

	// See if it compiled successfully

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(
			`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
		);
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

document.addEventListener("DOMContentLoaded", () => {
	const button = document.getElementById("get_answer") as HTMLButtonElement;
	if (button) {
		button.addEventListener("click", displayAnswer);
	}
	renderLoop();
	displayAnswer();
});
