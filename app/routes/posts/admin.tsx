import { Link, Outlet, useLoaderData } from "@remix-run/react"
import { json, LoaderFunction } from "@remix-run/node";
import { getPostsListings } from "~/models/posts.server";
import { requireAdminUser } from "~/session.server";


type LoaderData = {
    posts: Awaited<ReturnType<typeof getPostsListings>>
}

export const loader: LoaderFunction = async ({ request}) => {
    await requireAdminUser(request);
    return json<LoaderData>({ posts: await getPostsListings() })
}

export default function AdminRoute() {
    const { posts } = useLoaderData() as LoaderData;
    return (
        <div className="mx-auto max-w-4x1">
            <h1 className="my-6 mb-2 border-b-2 text-center text-3x1">Blog Admin</h1>
            <div className="grid grid-cols-4 gap-6">
                <nav>
                    <ul>
                        {posts.map((post) => (
                            <li key={post.slug}>
                                <Link to={post.slug} className="text-blue-600 underline">
                                    {post.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <main className="col-span-4 md:col-span-3">
                    <Outlet></Outlet>
                </main>
            </div>
        </div>
    )
}

export function ErrorBoundary({error}:{error:Error}) {
    return <div className="text-red-500">Oh no, something went wrong!
    <pre>{error.message}</pre>
    </div>

}