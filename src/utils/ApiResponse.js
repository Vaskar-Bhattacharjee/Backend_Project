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
        //this.errors = errors; {errors make problem if i use it. 500 error will be shown. because no error was passed on longin side} 
        
    }
}

export default ApiResponse