import { getAllPosts, getPostsByCategory } from "@/lib/supabase/posts";
import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  try {
    const posts = category ? await getPostsByCategory(category) : await getAllPosts();
    return NextResponse.json({
      success: true,
      data: posts,
      count: posts.length,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch posts',
    }, { status: 500 });
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 필수 필드 검증
    if (!body.slug || !body.title || !body.subtitle || !body.content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: slug, title, subtitle, content',
      }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        slug: body.slug,
        title: body.title,
        subtitle: body.subtitle,
        content: body.content,
        category: body.category || 'JavaScript',
        date: body.date || new Date().toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).toUpperCase(),
        reading_time: body.reading_time || body.readingTime || '10 Min', // 두 가지 필드명 모두 지원
        hero_image: body.hero_image || body.heroImage || '',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating post:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: data,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create post',
    }, { status: 500 });
  }
}