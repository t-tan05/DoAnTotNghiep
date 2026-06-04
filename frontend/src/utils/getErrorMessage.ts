export function getErrorMessage(error: unknown) {
    if(
        typeof error === "object" &&
        error !== null &&
        "backendMessage" in error
    ){
        return String((error as {backendMessage: string}).backendMessage);
    }

    if(error instanceof Error){
        return error.message;
    }

    return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}