import { drawScene } from "./draw-scene";
import { initBuffers } from "./init-buffers";
import type { ProgramInfo } from "./programinfo";

let cubeRotation = 0.0;
let deltaTime = 0;

var answers: string[] = [];

/// gets a batch of answers from the backend API
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

// function wrapText(
// 	ctx: CanvasRenderingContext2D,
// 	text: string,
// 	maxWidth: number,
// ): string[] {
// 	const words = text.split(/\s+/).filter(Boolean);
// 	const lines: string[] = [];
// 	let line = "";
// 	for (const word of words) {
// 		const testLine = line ? `${line} ${word}` : word;
// 		if (ctx.measureText(testLine).width > maxWidth && line) {
// 			lines.push(line);
// 			line = word;
// 		} else {
// 			line = testLine;
// 		}
// 	}
// 	if (line) {
// 		lines.push(line);
// 	}
// 	return lines.length ? lines : [text];
// }

function renderTetrahedron(): void {
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

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying lowp vec4 vColor;

        void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
        }
    `;

	// Fragment shader program
	const fsSource = `
        varying lowp vec4 vColor;

        void main(void) {
        gl_FragColor = vColor;
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
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(
				shaderProgram,
				"uProjectionMatrix",
			),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
		},
	};

	// Here's where we call the routine that builds all the
	// objects we'll be drawing.
	const buffers = initBuffers(gl);

	let then = 0;

	// Draw the scene repeatedly
	function render(now: number, gl: WebGLRenderingContext) {
		now *= 0.001; // convert to seconds
		deltaTime = now - then;
		then = now;

		drawScene(gl, programInfo, buffers, cubeRotation);
		cubeRotation += deltaTime;

		window.requestAnimationFrame((now) => render(now, gl));
	}
	window.requestAnimationFrame((now) => render(now, gl));
}

async function showError(message: string) {
	console.error(message);
	const errorDiv = document.getElementById("error");
	if (errorDiv) {
		errorDiv.textContent = message;
		errorDiv.classList.remove("hidden");
	}
}

async function displayAnswer() {
	const errorDiv = document.getElementById("error");
	try {
		const answerResponse = await getAnswers();
		if (!answerResponse.length) {
			showError("No answers received from the server.");
		} else {
			console.debug(`Received answers: ${answerResponse.join(" | ")}`);
			answers = answerResponse;
			const answerDiv = document.getElementById("answer");
			if (answerDiv) {
				answerDiv.textContent = answers[0];
				answerDiv.classList.remove("hidden");
			}
			if (errorDiv) {
				errorDiv.classList.add("hidden");
			}
		}
	} catch (error) {
		showError(`Error fetching answer: ${error}`);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const button = document.getElementById("get_answer") as HTMLButtonElement;
	if (button) {
		button.addEventListener("click", displayAnswer);
	}
	displayAnswer();

	renderTetrahedron();
});

//
// Initialize a shader program, so WebGL knows how to draw our data
//
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
