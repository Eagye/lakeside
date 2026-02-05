# Branch Locations Feature

## Overview
The Branch Locations feature allows Lakeside Farms to manage multiple branch locations and helps visitors get directions to their nearest branch.

## Features

### Frontend Features
- **Branch Selector**: Users can select which branch they want to visit from a dropdown menu
- **Interactive Map**: Shows all branch locations with markers on Google Maps
- **Color-Coded Markers**: 
  - Green marker: Currently selected branch
  - Red markers: Other available branches
- **Get Directions**: Users can enter their location and get driving directions to the selected branch
- **Branch Information**: Displays the selected branch name and address below the map

### Backend Features
- **Branch Management API**: Full CRUD operations for branch locations
- **Database Storage**: Branch data stored in SQLite database
- **Admin Control**: Admins can add, edit, or remove branches through the API

## Default Branches

The system comes with 4 pre-configured branches:

1. **Tamale - Kumbugu**
   - Address: Kumbugu, Tamale, Northern Region
   - Coordinates: 9.4034, -0.8424

2. **Nsawam Adoagyire**
   - Address: Adoagyire, Nsawam, Eastern Region
   - Coordinates: 5.8081, -0.3522

3. **Kwahu Tafo**
   - Address: Tafo, Kwahu, Eastern Region
   - Coordinates: 6.3167, -0.6333

4. **Tamale - Kamina**
   - Address: Kamina, Tamale, Northern Region
   - Coordinates: 9.4100, -0.8000

## How It Works

### User Experience
1. Visit the Contact page
2. See all available branches in the dropdown selector
3. Select a branch to view on the map
4. Enter your location or use "Current Location" button
5. Click "Get Directions" to see the route

### Technical Implementation
- **Entity**: `BranchEntity` stores branch data
- **Service**: `BranchService` handles business logic
- **Controller**: Branch endpoints in `AdminController` for management
- **Views**: Updated `contact.hbs` with branch selector and multi-marker map

## API Endpoints

### Admin Endpoints (Requires Authentication)

#### List all branches
```
GET /admin/branches
```

#### Create a new branch
```
POST /admin/branches
Body: {
  "name": "Branch Name",
  "address": "Full Address",
  "latitude": 5.6037,
  "longitude": -0.1870,
  "phone": "+233 123 456 789",
  "description": "Optional description",
  "displayOrder": 1
}
```

#### Update a branch
```
PUT /admin/branches/:id
Body: {
  "name": "Updated Name",
  "isActive": true,
  ...
}
```

#### Delete a branch
```
DELETE /admin/branches/:id
```

## Database Schema

```typescript
BranchEntity {
  id: number (primary key)
  name: string
  address: string
  latitude: decimal(10,7)
  longitude: decimal(10,7)
  isActive: boolean (default: true)
  displayOrder: number (default: 0)
  phone: string (nullable)
  description: text (nullable)
  createdAt: datetime
  updatedAt: datetime
}
```

## Future Enhancements

Potential improvements for the branch feature:

1. **Branch Details Page**: Individual pages for each branch with photos and details
2. **Business Hours**: Add opening/closing times for each branch
3. **Services Filter**: Allow users to filter branches by available services
4. **Branch Photos**: Upload and display photos for each branch
5. **Contact Forms**: Branch-specific contact forms
6. **Distance Calculation**: Show distance from user's location to each branch
7. **Branch Admin Panel**: Add a dedicated admin UI for managing branches (currently API-only)

## Testing

To test the branch feature:

1. Start the development server: `npm run start:dev`
2. Visit http://localhost:3000/contact
3. Select different branches from the dropdown
4. Try getting directions to each branch
5. Use Postman or similar tool to test the admin API endpoints

## Notes

- Branch coordinates should be accurate for proper map display
- The map will automatically adjust zoom level based on number of branches
- Inactive branches (isActive: false) won't appear on the contact page
- Branches are ordered by `displayOrder` (ascending) then by name
