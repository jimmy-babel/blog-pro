export async function getMoodRecords(blogger: string) {
  const response = await fetch(`/api/mood-records/get-mood-records?blogger=${blogger}`);
  const result = await response.json();
  return result?.data || [];
}
