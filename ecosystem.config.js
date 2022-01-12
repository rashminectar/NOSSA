module.exports = {
  apps: [
    {
      name: "nossa",
      script: "./server",
      watch: true,
      env: {
        "NODE_ENV": "development",
      }
    }
  ]
}