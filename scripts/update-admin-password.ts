import { DataSource } from 'typeorm';
import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';

// Generate a secure random password
function generateSecurePassword(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const bytes = randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

async function updateAdminPassword() {
  // Initialize database connection
  const dataSource = new DataSource({
    type: 'sqlite',
    database: './lakeside.sqlite',
    entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✓ Database connection established');

    // Generate new password
    const newPassword = generateSecurePassword(16);
    const passwordHash = await hash(newPassword, 10);

    // Check if admin user exists
    const adminExists = await dataSource.query(
      'SELECT id FROM admin_users WHERE username = ?',
      ['admin']
    );

    if (!adminExists || adminExists.length === 0) {
      console.log('❌ No admin user found with username "admin"');
      await dataSource.destroy();
      return;
    }

    // Update admin password
    await dataSource.query(
      'UPDATE admin_users SET passwordHash = ? WHERE username = ?',
      [passwordHash, 'admin']
    );

    console.log('\n✅ Admin password updated successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('NEW ADMIN CREDENTIALS:');
    console.log('═══════════════════════════════════════');
    console.log('Username:', 'admin');
    console.log('Password:', newPassword);
    console.log('═══════════════════════════════════════\n');
    console.log('⚠️  IMPORTANT: Save this password securely!');
    console.log('⚠️  You may want to update your .env file:\n');
    console.log(`    ADMIN_PASSWORD=${newPassword}\n`);

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error updating password:', error);
    process.exit(1);
  }
}

updateAdminPassword();
