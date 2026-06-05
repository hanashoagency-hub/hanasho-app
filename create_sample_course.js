const { createClient } = require('@supabase/supabase-js');


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addSampleCourse() {
  console.log("Adding sample paid course...");
  
  // 1. Insert Course
  const { data: course, error: courseErr } = await supabase.from('courses').insert({
    title: 'Fullstack Web Development in Somali',
    description: 'Baro sida loo dhiso websites casri ah oo wata Next.js, React, iyo Supabase, adigoo adeegsanaya afkaaga hooyo.',
    price: 15.00,
    cover_image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }).select().single();

  if (courseErr) {
    console.error("Error creating course:", courseErr);
    return;
  }

  console.log("Course created:", course.title, "ID:", course.id);

  // 2. Insert Module
  const { data: module, error: modErr } = await supabase.from('modules').insert({
    course_id: course.id,
    title: 'Qaybta 1aad: Hordhaca Next.js',
    sort_order: 0
  }).select().single();

  if (modErr) {
    console.error("Error creating module:", modErr);
    return;
  }

  // 3. Insert Lessons (One preview, one locked)
  const { error: lessErr } = await supabase.from('lessons').insert([
    {
      module_id: module.id,
      title: 'Hordhac & Dejinta Barnaamijka',
      youtube_video_id: 'dQw4w9WgXcQ', // Placeholder
      duration_minutes: 10,
      is_preview: true,
      sort_order: 0
    },
    {
      module_id: module.id,
      title: 'Dhisida Bogga Hore (Frontend)',
      youtube_video_id: 'jNQXAC9IVRw', // Placeholder
      duration_minutes: 25,
      is_preview: false,
      sort_order: 1
    }
  ]);

  if (lessErr) console.error("Error creating lessons:", lessErr);
  else console.log("Sample course with modules and lessons successfully added!");
}

addSampleCourse();
