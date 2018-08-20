module.exports = function HttpError(status, message) {
  this.status = status;
  this.message = {
    message: message
  };
}