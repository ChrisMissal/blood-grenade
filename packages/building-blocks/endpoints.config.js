module.exports = {
  "task-runner": {
    host: "localhost",
    portRange: [4000, 4100],
    defaultPort: 4000,
    endpoints: [
      { name: "health", path: "/health", method: "GET", expect: { status: 200, body: { status: "healthy" } } },
      { name: "info", path: "/info", method: "GET", expect: { status: 200 } }
    ]
  },
  "web-app": {
    host: "localhost",
    portRange: [4001, 4101],
    defaultPort: 4001,
    endpoints: [
      { name: "health", path: "/health", method: "GET", expect: { status: 200 } }
    ]
  },
  "web-jobs": {
    host: "localhost",
    portRange: [4002, 4102],
    defaultPort: 4002,
    endpoints: [
      { name: "health", path: "/health", method: "GET", expect: { status: 200 } }
    ]
  }
};
