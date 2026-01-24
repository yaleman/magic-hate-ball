// https://glmatrix.net/docs/module-mat4.html
import { mat4 } from "gl-matrix";
import type { Buffers } from "./init-buffers.js";
import type { ProgramInfo } from "./programinfo.js";

type Rotation = {
	x: number;
	y: number;
	z: number;
};

function drawScene(
	gl: WebGLRenderingContext,
	programInfo: ProgramInfo,
	buffers: Buffers,
	texture: WebGLTexture | null,
	rotation: Rotation,
) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
	gl.clearDepth(1.0); // Clear everything
	gl.enable(gl.DEPTH_TEST); // Enable depth testing
	gl.depthFunc(gl.LEQUAL); // Near things obscure far things

	// Clear the canvas before we start drawing on it.

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Create a perspective matrix, a special matrix that is
	// used to simulate the distortion of perspective in a camera.
	// Our field of view is 45 degrees, with a width/height
	// ratio that matches the display size of the canvas
	// and we only want to see objects between 0.1 units
	// and 100 units away from the camera.

	const fieldOfView = (45 * Math.PI) / 180; // in radians
	// ensure the canvas is what we expect
	var width: number;
	var height: number;
	if (gl.canvas instanceof HTMLCanvasElement) {
		width = gl.canvas.clientWidth;
		height = gl.canvas.clientHeight;

		// Use width/height for rendering
	} else {
		// For OffscreenCanvas, use canvas.width and canvas.height directly
		width = gl.canvas.width;
		height = gl.canvas.height;
	}
	const aspect = width / height;
	const zNear = 0.1;
	const zFar = 100.0;
	const projectionMatrix = mat4.create();

	// note: glmatrix.js always has the first argument
	// as the destination to receive the result.
	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

	// Set the drawing position to the "identity" point, which is
	// the center of the scene.
	const modelViewMatrix = mat4.create();

	// Now move the drawing position a bit to where we want to
	// start drawing the square.
	mat4.translate(
		modelViewMatrix, // destination matrix
		modelViewMatrix, // matrix to translate
		[-0.0, 0.0, -6.0],
	); // amount to translate

	mat4.rotate(
		modelViewMatrix, // destination matrix
		modelViewMatrix, // matrix to rotate
		rotation.z, // amount to rotate in radians
		[0, 0, 1],
	); // axis to rotate around (Z)
	mat4.rotate(
		modelViewMatrix, // destination matrix
		modelViewMatrix, // matrix to rotate
		rotation.y, // amount to rotate in radians
		[0, 1, 0],
	); // axis to rotate around (Y)
	mat4.rotate(
		modelViewMatrix, // destination matrix
		modelViewMatrix, // matrix to rotate
		rotation.x, // amount to rotate in radians
		[1, 0, 0],
	); // axis to rotate around (X)

	// Tell WebGL how to pull out the positions from the position
	// buffer into the vertexPosition attribute.
	setPositionAttribute(gl, buffers, programInfo);

	setColorAttribute(gl, buffers, programInfo);

	setTextureAttribute(gl, buffers, programInfo);

	// Tell WebGL which indices to use to index the vertices
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

	// Tell WebGL to use our program when drawing
	gl.useProgram(programInfo.program);

	// Set the shader uniforms
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.projectionMatrix,
		false,
		projectionMatrix,
	);
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.modelViewMatrix,
		false,
		modelViewMatrix,
	);

	if (texture) {
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
	}

	{
		const vertexCount = 36;
		const type = gl.UNSIGNED_SHORT;
		const offset = 0;
		gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
	}
}

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
function setPositionAttribute(
	gl: WebGLRenderingContext,
	buffers: { position: WebGLBuffer | null },
	programInfo: { attribLocations: { vertexPosition: number } },
) {
	const numComponents = 3;
	const type = gl.FLOAT; // the data in the buffer is 32bit floats
	const normalize = false; // don't normalize
	const stride = 0; // how many bytes to get from one set of values to the next
	// 0 = use type and numComponents above
	const offset = 0; // how many bytes inside the buffer to start from
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
	gl.vertexAttribPointer(
		programInfo.attribLocations.vertexPosition,
		numComponents,
		type,
		normalize,
		stride,
		offset,
	);
	gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

// Tell WebGL how to pull out the colors from the color buffer
// into the vertexColor attribute.
function setColorAttribute(
	gl: WebGLRenderingContext,
	buffers: { color: WebGLBuffer | null },
	programInfo: { attribLocations: { vertexColor: number } },
) {
	const numComponents = 4;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
	gl.vertexAttribPointer(
		programInfo.attribLocations.vertexColor,
		numComponents,
		type,
		normalize,
		stride,
		offset,
	);
	gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
}

function setTextureAttribute(
	gl: WebGLRenderingContext,
	buffers: { textureCoord: WebGLBuffer | null },
	programInfo: { attribLocations: { textureCoord: number } },
) {
	const numComponents = 2;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
	gl.vertexAttribPointer(
		programInfo.attribLocations.textureCoord,
		numComponents,
		type,
		normalize,
		stride,
		offset,
	);
	gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
}

export { drawScene };
