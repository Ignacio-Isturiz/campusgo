function toUserPayload(user) {
  return {
    id: String(user._id),
    email: user.email,
    role: user.role,
    photoUrl: user.photoUrl || null,
  };
}

function respondWithError(res, error, fallbackMessage) {
  return res.status(error.statusCode || 500).json({
    message: error.message || fallbackMessage,
  });
}

module.exports = {
  respondWithError,
  toUserPayload,
};
