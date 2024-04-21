export async function POST(req: Request) {
    console.log(req.headers.get("dg-token"));
    console.dir(req);
}
