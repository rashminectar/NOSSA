module.exports = {
    apps : [
        {
          name: "kindal",
          script: "./server",
          watch: true,
          env: {
            "NODE_ENV": "development",
          }
        }
    ]
  }