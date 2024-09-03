/* eslint-disable @next/next/no-img-element */
import { BackButton } from "@/components/BackButton";
import Editor from "@/components/editor/advanced-editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { authOptions } from "@/server/auth";
import { type BlogProps } from "@/types/types";
import { getServerSession } from "next-auth";
import Link from "next/link";

const getBlog = async (id: string) => {
  const responce = await fetch(`http://localhost:3000/api/blogs/${id}`, {
    next: {
      revalidate: 60,
    },
  });
  if (!responce.ok) {
    throw new Error(`Failed to get Blog: ${id}`);
  }
  const data: BlogProps = (await responce.json()) as BlogProps;
  return data;
};

const Blog = async ({ params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions);
  const { id } = params;
  const blog: BlogProps = await getBlog(id);

  if (!blog) {
    return <div> Error fetching blog or no blod available with id: {id} </div>;
  }
  return (
    <div className="mx-auto mb-8 flex max-w-6xl flex-col space-y-4 px-4 pt-8 sm:px-8">
      <div className="mb-4 flex max-h-fit items-center justify-between">
        <BackButton />
        {blog.authorId === session?.user.id && (
          <Link className={buttonVariants()} href={`/blog/${blog.id}/edit`}>
            Edit blog
          </Link>
        )}
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="space-y-4">
          <div className="text-xs text-muted-foreground">
            {new Date(blog.createdAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
          <h1 className="text-display-5 font-semibold leading-normal lg:text-4xl">
            {blog.title}
          </h1>
          <div className="flex gap-2">
            <Avatar>
              <AvatarImage src={blog.author.avatar} />
              <AvatarFallback>
                {blog.author.name
                  .split(" ")
                  .map((word) => word.charAt(0))
                  .join("")
                  .toLocaleUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="">
              <p className="text-sm font-semibold">{blog.author.name}</p>
              <Link href={`/${blog.authorId}`} className="text-sm text-primary">
                @{blog.author.name.split(" ")[0]}
              </Link>
            </div>
          </div>
        </div>
        <div className="not-prose relative my-10 overflow-hidden rounded-2xl first:mt-0 last:mb-0 [a:not(:first-child)>&]:mt-10 [a:not(:last-child)>&]:mb-10 [figure>&]:my-0">
          <img src={blog.image} alt="Uploaded" className="h-auto w-full" />
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-900/10 dark:ring-white/10"></div>
        </div>
        <Editor editable={false} initialValue={blog.content} />
      </div>
    </div>
  );
};

export default Blog;
