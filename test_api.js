async function runTest() {
  try {
    console.log("Starting session...");
    const res1 = await fetch('http://localhost:5000/api/usability/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_uuid: 'test-uuid-1234',
        version: 'A'
      })
    });
    console.log("Session response:", res1.status, await res1.text());

    console.log("Logging tasks in bulk...");
    const res2 = await fetch('http://localhost:5000/api/usability/tasks/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_uuid: 'test-uuid-1234',
        tasks: [
          {
            task_number: 1,
            status: 'completed',
            duration_ms: 1000,
            interactions_count: 5,
            used_search: true,
            used_minimap: false
          },
          {
            task_number: 2,
            status: 'skipped',
            duration_ms: 500,
            interactions_count: 2,
            used_search: false,
            used_minimap: true
          }
        ]
      })
    });
    console.log("Bulk Task response:", res2.status, await res2.text());
  } catch (error) {
    console.error("Error:", error);
  }
}

runTest();
