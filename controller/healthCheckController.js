export const healthCheck = async (req, res) => {
  try {
    return res.status(200).json({
      status: "ok",
      message: "Live server is running",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(), // in seconds
    });
  } catch (error) {
    console.error("Health check error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server health check failed",
    });
  }
};
