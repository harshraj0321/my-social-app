import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth"; // Import your auth helper

export default async function HomePage() {
  const session = await auth(); // Get the current logged-in user
  const posts = await db.post.findMany({ orderBy: { createdAt: "desc" } });

  async function createPost(formData: FormData) {
    "use server";
    if (!session?.user) return; // Stop if not logged in
    
    const content = formData.get("content") as string;
    await db.post.create({ 
      data: { 
        content, 
        createdById: session.user.id 
      } 
    });
    revalidatePath("/");
  }

  return (
    <main className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Social App</h1>
      
      {session?.user ? (
        <form action={createPost} className="flex flex-col gap-2 mb-8">
          <textarea name="content" className="border p-2 rounded" placeholder="Write something..." required />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded">Post</button>
        </form>
      ) : (
        <p className="mb-8">Please sign in to post.</p>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="p-4 border rounded shadow">{post.content}</div>
        ))}
      </div>
    </main>
  );
}