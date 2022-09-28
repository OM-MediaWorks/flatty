export const awaitResources = async () => {
  const resources = Object.values(Deno.resources())
  if (resources.includes('timer')) {
    await new Promise(resolve => setTimeout(resolve, 400));
  }
}