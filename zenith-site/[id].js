export async function onRequestGet(context) {
  const { id } = context.params;

  if (!id || id.includes(".") || id.includes("/")) {
    return new Response("Invalid ID", { status: 400 });
  }

  try {
    const url = `https://zenith-cloud-fff6b-default-rtdb.firebaseio.com/scripts/${id}.json`;
    const res = await fetch(url);

    if (!res.ok) {
      return new Response("Script not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    const data = await res.json();

    if (!data || !data.content) {
      return new Response("Script not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    return new Response(data.content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    return new Response("Error fetching script", { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}
