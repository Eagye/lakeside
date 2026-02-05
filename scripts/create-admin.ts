import { DataSource } from 'typeorm';
import { hash } from 'bcryptjs';

async function createAdmin() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    entities: ['src/**/*.entity.ts'],
  });

  try {
    await dataSource.initialize();
    console.log('Connected to database');

    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    
    console.log(`Creating admin user: ${username}`);
    
    const passwordHash = await hash(password, 10);
    
    // Delete existing admin if any
    await dataSource.query('DELETE FROM admin_user WHERE username = $1', [username]);
    
    // Insert new admin
    await dataSource.query(
      'INSERT INTO admin_user (username, "passwordHash") VALUES ($1, $2)',
      [username, passwordHash]
    );
    
    console.log('✅ Admin user created successfully!');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

createAdmin();
