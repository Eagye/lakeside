# News Feature Documentation

## Overview
A complete News management system has been added to Lakeside Farms with beautiful frontend display and powerful admin controls.

## Features

### Frontend Features
1. **News Listing Page** (`/news`)
   - Beautiful card-based layout with cover images
   - Filter by All/Featured/Recent
   - Author information and publish dates
   - Photo count indicators
   - Responsive grid layout
   - Smooth animations and hover effects

2. **News Detail Page** (`/news/:id`)
   - Full article display with rich formatting
   - Automatic image slider/gallery with multiple images
   - Touch-swipe support on mobile
   - Auto-play with pause on hover
   - Image captions
   - Related news sidebar
   - Social sharing buttons (Facebook, Twitter)
   - Author information with avatars

### Admin Features
1. **News Management Dashboard** (`/admin` → News & Updates)
   - Create, edit, and delete news articles
   - Upload cover images
   - Manage multiple sliding images per article
   - Add captions to images
   - Set featured/published status
   - Set custom publish dates
   - Author attribution
   - Draft/published workflow

2. **News Statistics**
   - Dashboard shows total news articles count
   - Auto-updating stats

## Database Schema

### News Entity
- `id`: Primary key
- `title`: Article title
- `content`: Full article content
- `excerpt`: Short summary for previews
- `author`: Author name
- `featured`: Boolean flag for featured articles
- `published`: Boolean flag for published status
- `publishDate`: Publication date
- `coverImageUrl`: Main cover image URL
- `sortOrder`: Manual sorting order
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### NewsImage Entity
- `id`: Primary key
- `newsId`: Foreign key to news article
- `filename`: Image filename
- `url`: Full image URL
- `caption`: Optional image caption
- `sortOrder`: Image order in slider
- `createdAt`: Upload timestamp

## Admin Usage

### Creating a News Article
1. Go to `/admin` and log in
2. Click on "News & Updates" in the sidebar
3. Click "Add News Article" button
4. Fill in the article details:
   - Title
   - Excerpt (appears on listing page)
   - Content (main article body)
   - Author name
   - Publish date
5. Upload a cover image (optional but recommended)
6. Check "Featured" to highlight the article
7. Check "Published" to make it visible on the frontend
8. Click "Save"

### Adding Multiple Images
1. After creating/editing a news article
2. Click "Manage Images" button
3. Click "Upload Images" in the modal
4. Select multiple images (up to 20)
5. Add captions to each image (optional)
6. Images will appear in a beautiful slider on the detail page

### Image Slider Features
- Automatic slide transition (5 seconds)
- Manual navigation with prev/next buttons
- Dot indicators for quick navigation
- Keyboard support (arrow keys)
- Touch swipe on mobile devices
- Pause on hover
- Image counter display

## Frontend Navigation

The News link has been added to:
- Main navigation menu (all pages)
- Mobile navigation menu
- Footer quick links (all pages)

## Styling & Design

The News pages feature:
- Beautiful gradient hero sections
- Modern card layouts
- Smooth animations and transitions
- Responsive design for all screen sizes
- Professional typography
- Green color scheme matching Lakeside branding
- High-quality image handling
- Optimized for readability

## File Structure

```
src/
├── news/
│   ├── news.entity.ts           # News article entity
│   ├── news-image.entity.ts     # News images entity
│   ├── news.service.ts          # Business logic
│   └── news.module.ts           # Module definition

views/
├── news.hbs                     # News listing page
└── news-detail.hbs             # News detail page with slider

public/
└── uploads/
    └── news/                    # News images upload directory
```

## API Endpoints

### Admin Endpoints (Protected)
- `GET /admin/news` - List all news
- `GET /admin/news/:id` - Get news with images
- `POST /admin/news` - Create news article
- `PUT /admin/news/:id` - Update news article
- `DELETE /admin/news/:id` - Delete news article
- `POST /admin/news/:id/cover` - Upload cover image
- `GET /admin/news/:id/images` - List article images
- `POST /admin/news/:id/images` - Upload multiple images
- `PUT /admin/news/images/:imageId/caption` - Update image caption
- `DELETE /admin/news/images/:imageId` - Delete image

### Public Endpoints
- `GET /news` - View news listing (published only)
- `GET /news/:id` - View news detail

## Image Requirements
- Format: JPG, PNG, GIF, WEBP
- Max size: 8MB per image
- Recommended dimensions:
  - Cover: 1200x600px
  - Slider images: 1200x800px

## Tips for Best Results

1. **Write compelling excerpts**: The excerpt appears on the listing page, so make it engaging
2. **Use high-quality images**: Images are central to the news feature
3. **Add captions**: Help readers understand what they're looking at
4. **Set proper dates**: Use the publish date to control article ordering
5. **Use Featured wisely**: Featured articles stand out with a gold badge
6. **Keep drafts unpublished**: Work on articles before making them public
7. **Multiple images**: Add 3-8 images for the best slider experience

## Next Steps

To start using the News feature:
1. Build and restart the application: `npm run build && npm run start:dev`
2. Log in to the admin panel at `/admin`
3. Navigate to "News & Updates"
4. Create your first news article
5. View it on the frontend at `/news`

Enjoy your new News feature!
