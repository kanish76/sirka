export default {
  async fetch(request, env) {

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const body = await request.json();
      const { name, phone, items, address } = body;

      if (!name || !phone || !items || !address) {
        return new Response(
          JSON.stringify({ error: "All fields required" }),
          { status: 400, headers }
        );
      }

      await env.DB.prepare(
        `INSERT INTO orders (name, phone, items, address)
         VALUES (?, ?, ?, ?)`
      ).bind(name, phone, items, address).run();

      const message = `Hi Sirka! I'd like to place an order.

Name: ${name}
Phone: ${phone}
Order: ${items}
Address: ${address}`;

      const waUrl = `https://wa.me/916360100954?text=${encodeURIComponent(message)}`;

      return new Response(
        JSON.stringify({ redirect: waUrl }),
        { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Something went wrong" }),
        { status: 500, headers }
      );
    }
  }
};
