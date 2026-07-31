import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapBlogPostRow } from "@/lib/mappers";
import { Table, TableHead, TableBody, TableRow, TableCell, EmptyState } from "@/components/admin/Table";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import { deleteBlogPost } from "./actions";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("blog_posts").select("*").order("date", { ascending: false });
  const posts = (rows ?? []).map(mapBlogPostRow);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Blog</h1>
        <Button href="/admin/dashboard/blog/new" size="sm">
          <Plus className="h-4 w-4" />
          Add Post
        </Button>
      </div>

      <div className="mt-6">
        <Table>
          <TableHead columns={["Title", "Category", "Date", "Author", "Actions"]} />
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>{post.title}</TableCell>
                <TableCell>{post.category}</TableCell>
                <TableCell>{formatDate(post.date)}</TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/dashboard/blog/${post.id}/edit`}
                      className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <ConfirmDeleteButton action={deleteBlogPost.bind(null, post.id)} itemLabel={post.title} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!posts.length && <EmptyState message="No blog posts yet." />}
      </div>
    </div>
  );
}
