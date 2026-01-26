export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          slug: string
          title: string
          subtitle: string
          content: string
          category: string
          date: string
          reading_time: string
          hero_image: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          subtitle: string
          content: string
          category: string
          date: string
          reading_time: string
          hero_image: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          subtitle?: string
          content?: string
          category?: string
          date?: string
          reading_time?: string
          hero_image?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
