export async function getMoodRecords(blogger: string) {
  const response = await fetch(`/api/blog/get-mood-records?blogger=${blogger}`);
  const result = await response.json();
  return result?.data || [];
}
