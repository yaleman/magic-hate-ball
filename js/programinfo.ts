type ProgramInfo = {
	program: WebGLProgram | null;
	attribLocations: {
		vertexPosition: number;
		vertexColor: number;
		textureCoord: number;
	};
	uniformLocations: {
		projectionMatrix: WebGLUniformLocation | null;
		modelViewMatrix: WebGLUniformLocation | null;
		uSampler: WebGLUniformLocation | null;
	};
};

export type { ProgramInfo };
