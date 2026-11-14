export default async function teardown() {
  // Explicit shutdown avoids leaving test servers behind on Windows.
  await Promise.allSettled(
    [5000, 5173].map((port) =>
      fetch(`http://127.0.0.1:${port}/__test/shutdown`, {
        method: 'POST',
        signal: AbortSignal.timeout(5000),
      }),
    ),
  );
  await new Promise((resolve) => setTimeout(resolve, 300));
}
