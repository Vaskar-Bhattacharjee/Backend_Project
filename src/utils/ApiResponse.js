class ApiResponse {
    constructor(
        statusCode,
        data,
        message ="Success",
        stack = ""
    ){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
        
        this.errors = errors;
    }
}

export default ApiResponse