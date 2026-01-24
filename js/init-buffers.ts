type Buffers = {
	position: WebGLBuffer | null;
	color: WebGLBuffer | null;
	textureCoord: WebGLBuffer | null;
	indices: WebGLBuffer | null;
};

function initBuffers(gl: WebGLRenderingContext): Buffers {
	const positionBuffer = initPositionBuffer(gl);

	if (!positionBuffer) throw Error("Failed to initialize position buffer");

	const colorBuffer = initColorBuffer(gl);
	if (!colorBuffer) throw Error("Failed to initialize color buffer");

	const textureCoordBuffer = initTextureBuffer(gl);
	if (!textureCoordBuffer) throw Error("Failed to initialize texture buffer");

	const indexBuffer = initIndexBuffer(gl);
	if (!indexBuffer) throw Error("Failed to initialize position buffer");
	return {
		position: positionBuffer,
		color: colorBuffer,
		textureCoord: textureCoordBuffer,
		indices: indexBuffer,
	};
}

function initPositionBuffer(gl: WebGLRenderingContext) {
	// Create a buffer for the square's positions.
	const positionBuffer = gl.createBuffer();

	// Select the positionBuffer as the one to apply buffer
	// operations to from here out.
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	const positions = [
		// Front face
		-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

		// Back face
		-1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

		// Top face
		-1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

		// Bottom face
		-1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

		// Right face
		1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

		// Left face
		-1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
	];

	// Now pass the list of positions into WebGL to build the
	// shape. We do this by creating a Float32Array from the
	// JavaScript array, then use it to fill the current buffer.
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	return positionBuffer;
}

function initColorBuffer(gl: WebGLRenderingContext) {
	const faceColors = [
		[1.0, 1.0, 1.0, 1.0], // Front face
		[1.0, 1.0, 1.0, 1.0], // Back face
		[1.0, 1.0, 1.0, 1.0], // Top face
		[1.0, 1.0, 1.0, 1.0], // Bottom face
		[1.0, 1.0, 1.0, 1.0], // Right face
		[1.0, 1.0, 1.0, 1.0], // Left face
	];

	// Convert the array of colors into a table for all the vertices.

	var colors: number[] = [];
	var j: number;
	for (j = 0; j < faceColors.length; ++j) {
		const c = faceColors[j];
		// Repeat each color four times for the four vertices of the face
		colors = colors.concat(c, c, c, c);
	}

	const colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	return colorBuffer;
}

function initTextureBuffer(gl: WebGLRenderingContext) {
	const columns = 3;
	const rows = 2;
	const uStep = 1 / columns;
	const vStep = 1 / rows;
	const faceCells = [
		{ col: 0, row: 0 }, // Front
		{ col: 1, row: 0 }, // Back
		{ col: 2, row: 0 }, // Top
		{ col: 0, row: 1 }, // Bottom
		{ col: 1, row: 1 }, // Right
		{ col: 2, row: 1 }, // Left
	];

	const textureCoordinates: number[] = [];
	for (const cell of faceCells) {
		const u0 = cell.col * uStep;
		const u1 = (cell.col + 1) * uStep;
		const v0 = cell.row * vStep;
		const v1 = (cell.row + 1) * vStep;
		textureCoordinates.push(u0, v0, u1, v0, u1, v1, u0, v1);
	}

	const textureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(textureCoordinates),
		gl.STATIC_DRAW,
	);

	return textureCoordBuffer;
}

function initIndexBuffer(gl: WebGLRenderingContext) {
	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	// This array defines each face as two triangles, using the
	// indices into the vertex array to specify each triangle's
	// position.

	const indices = [
		0,
		1,
		2,
		0,
		2,
		3, // front
		4,
		5,
		6,
		4,
		6,
		7, // back
		8,
		9,
		10,
		8,
		10,
		11, // top
		12,
		13,
		14,
		12,
		14,
		15, // bottom
		16,
		17,
		18,
		16,
		18,
		19, // right
		20,
		21,
		22,
		20,
		22,
		23, // left
	];

	// Now send the element array to GL

	gl.bufferData(
		gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(indices),
		gl.STATIC_DRAW,
	);

	return indexBuffer;
}

export { initBuffers, type Buffers };
