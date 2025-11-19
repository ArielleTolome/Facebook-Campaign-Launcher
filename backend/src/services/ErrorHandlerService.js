class ErrorHandlerService {
  handle(error) {
    if (error.response) {
      const fbError = error.response.data.error;
      if (this.isApiDown(error.response.status)) {
        return new Error('Facebook API is currently unavailable. Please try again later.');
      }
      return new Error(`Facebook API Error: ${fbError.message} (Code: ${fbError.code})`);
    }
    return error;
  }

  isApiDown(status) {
    return status >= 500;
  }
}

module.exports = new ErrorHandlerService();
