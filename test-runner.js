const http = require('http');

async function runTest() {
  console.log("Connecting to SSE stream...");
  
  const req = http.get('http://localhost:3000/api/orchestration/status', (res) => {
    console.log("SSE Connected. Status:", res.statusCode);
    
    res.on('data', (chunk) => {
      const data = chunk.toString();
      if (data.trim()) {
        console.log("[SSE] " + data.trim());
      }
      
      if (data.includes('"type":"complete"') || data.includes('"type":"error"')) {
        console.log("Execution finished. Exiting in 2 seconds...");
        setTimeout(() => process.exit(0), 2000);
      }
    });
  });

  req.on('error', (e) => {
    console.error("SSE Error:", e.message);
  });

  // Wait a moment for SSE to connect, then trigger the execution
  setTimeout(async () => {
    console.log("Triggering orchestration...");
    try {
      const response = await fetch('http://localhost:3000/api/orchestration/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: "Generate a competitive analysis of NVIDIA and AMD using premium market intelligence." })
      });
      const text = await response.text();
      console.log("Execution triggered:", text);
    } catch (e) {
      console.error("Trigger Error:", e.message);
    }
  }, 1000);
}

runTest();
