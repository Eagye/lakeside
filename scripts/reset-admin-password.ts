import { DataSource } from 'typeorm';
import { hash } from 'bcryptjs';

async function resetAdminPassword() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  
  console.log(`🔧 Resetting password for user: ${username}`);
  
  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    synchronize: false,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connected to database');
    
    const passwordHash = await hash(password, 10);
    
    // Update the admin user's password
    const result = await dataSource.query(
      'UPDATE admin_user SET "passwordHash" = $1 WHERE username = $2',
      [passwordHash, username]
    );
    
    if (result[1] === 0) {
      console.log('❌ No admin user found with username:', username);
      console.log('Creating new admin user...');
      
      await dataSource.query(
        'INSERT INTO admin_user (username, "passwordHash") VALUES ($1, $2)',
        [username, passwordHash]
      );
      console.log('✅ New admin user created!');
    } else {
      console.log('✅ Admin password updated successfully!');
    }
    
    console.log(`\nYou can now login with:`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

resetAdminPassword();
