// import { createClient } from '@supabase/supabase-js'
// import { config } from 'dotenv'
// import { resolve } from 'path'
// // import { posts } from '../data/posts'

// // .env.local 파일 로드
// config({ path: resolve(__dirname, '../.env.local') })

// const supabaseUrl = process.env.SUPABASE_URL
// // Migration scripts need service role key to bypass RLS policies
// const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// if (!supabaseUrl || !supabaseServiceRoleKey) {
//   console.error('❌ Missing required environment variables:')
//   console.error('SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
//   console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✓' : '✗')
//   console.error('\n⚠️  Note: Migration scripts require SUPABASE_SERVICE_ROLE_KEY (not anon key)')
//   console.error('   This key bypasses RLS policies and should NEVER be exposed publicly.')
//   console.error('   Get it from: Supabase Dashboard > Settings > API > service_role key')
//   console.error('\nPlease check your .env.local file')
//   process.exit(1)
// }

// console.log('✅ Environment variables loaded')
// console.log('📡 Connecting to Supabase with service role key...')
// console.log('⚠️  Using service role key (bypasses RLS policies)')

// const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
//   auth: {
//     autoRefreshToken: false,
//     persistSession: false
//   }
// })

// async function migratePosts() {
//   const postsArray = Object.values(posts)
//   const total = postsArray.length

//   console.log(`\n📝 Starting migration of ${total} posts...\n`)

//   let successCount = 0
//   let errorCount = 0

//   for (let i = 0; i < postsArray.length; i++) {
//     const post = postsArray[i]
//     const progress = `[${i + 1}/${total}]`

//     try {
//       // 먼저 중복 체크
//       const { data: existing, error: checkError } = await supabase
//         .from('posts')
//         .select('slug')
//         .eq('slug', post.slug)
//         .maybeSingle()

//       if (existing && !checkError) {
//         console.log(`${progress} ⚠️  Skipping ${post.slug} (already exists)`)
//         continue
//       }

//       const { data, error } = await supabase
//         .from('posts')
//         .insert({
//           slug: post.slug,
//           title: post.title,
//           subtitle: post.subtitle,
//           content: post.content,
//           category: post.category,
//           date: post.date,
//           reading_time: post.readingTime,
//           hero_image: post.heroImage,
//         })
//         .select()

//       if (error) {
//         console.error(`${progress} ❌ Error inserting ${post.slug}:`, error.message)
//         errorCount++
//       } else {
//         console.log(`${progress} ✅ Successfully inserted: ${post.slug}`)
//         successCount++
//       }
//     } catch (error: any) {
//       console.error(`${progress} ❌ Unexpected error for ${post.slug}:`, error.message)
//       errorCount++
//     }
//   }

//   console.log('\n' + '='.repeat(50))
//   console.log('📊 Migration Summary:')
//   console.log(`   ✅ Success: ${successCount}`)
//   console.log(`   ❌ Errors: ${errorCount}`)
//   console.log(`   📝 Total: ${total}`)
//   console.log('='.repeat(50))
// }

// // 실행
// migratePosts()
//   .then(() => {
//     console.log('\n🎉 Migration completed!')
//     process.exit(0)
//   })
//   .catch((error) => {
//     console.error('\n💥 Migration failed:', error)
//     process.exit(1)
//   })
