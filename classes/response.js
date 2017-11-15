'use strict';

class Response {
	constructor(code, message, result, error) {
		this.response = {
			code: 0,
			message: '',
			error: null,
			result: null
		};
		this.response.code = code;
		this.response.message = message;
		this.response.result = result;
		this.response.error = error;
	}
	getJSON() {
		return this.response;
	}	
}

module.exports = Response;