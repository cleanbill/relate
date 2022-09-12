import { useLoaderData } from "@remix-run/react";
import { LoaderFunction, json } from "@remix-run/server-runtime";
import { getPost } from "~/models/posts.server";
import {marked} from 'marked';
import invariant from "tiny-invariant";

type LoaderData = {
    title: string;
    html: string
}

export const loader:LoaderFunction = async ({params}) =>{
    const {slug} = params;
    invariant(slug, 'slug is required');
    const post = await getPost(slug);
    invariant(post, `post not found ${slug}`);
    const html = marked(post?.markdown);
    return json<LoaderData>({title:post?.title, html})
}

export default function PostsRoute() {
    const {title, html} = useLoaderData() as LoaderData;
    return (
        <main className="mx-auto max-w-4x1">
            <h1 className="my-6 border-b-2 text-center text-3x1">{title}</h1>
            <div dangerouslySetInnerHTML={{__html:html}} />
        </main>

    );
}