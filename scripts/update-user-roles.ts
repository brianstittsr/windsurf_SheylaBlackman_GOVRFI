/**
 * Update User Roles Script
 * 
 * Usage: npx tsx scripts/update-user-roles.ts
 * 
 * This script updates:
 * - brianstittsr@gmail.com to SuperAdmin
 * - sblackman@itmcsolutions.com to Admin
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../service-account-key.json');

if (getApps().length === 0) {
  try {
    initializeApp({
      credential: cert(serviceAccountPath),
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin. Make sure service-account-key.json exists.');
    console.error('Download it from Firebase Console > Project Settings > Service Accounts');
    process.exit(1);
  }
}

const auth = getAuth();
const db = getFirestore();

interface UserRoleUpdate {
  email: string;
  role: 'superadmin' | 'admin';
  name: string;
}

const ROLE_UPDATES: UserRoleUpdate[] = [
  { email: 'brianstittsr@gmail.com', role: 'superadmin', name: 'Brian Stitt' },
  { email: 'sblackman@itmcsolutions.com', role: 'admin', name: 'Sheyla Blackman' },
];

async function updateUserRoles() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║     UPDATE USER ROLES                     ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  for (const update of ROLE_UPDATES) {
    console.log(`\n📧 Processing: ${update.email}`);
    console.log(`   Target Role: ${update.role}`);
    console.log('─'.repeat(50));

    try {
      // 1. Find user in Firebase Auth
      let user;
      try {
        user = await auth.getUserByEmail(update.email);
        console.log(`   ✓ Found Firebase Auth user: ${user.uid}`);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          console.log(`   ⚠ User not found in Firebase Auth, creating...`);
          user = await auth.createUser({
            email: update.email,
            displayName: update.name,
            password: 'TempPassword123!', // User should reset this
          });
          console.log(`   ✓ Created Firebase Auth user: ${user.uid}`);
        } else {
          throw error;
        }
      }

      // 2. Set custom claims for the role
      const claims: Record<string, boolean> = {
        role: true,
        admin: true,
      };
      if (update.role === 'superadmin') {
        claims.superadmin = true;
      }
      
      await auth.setCustomUserClaims(user.uid, { 
        role: update.role,
        ...claims 
      });
      console.log(`   ✓ Set custom claims: role=${update.role}`);

      // 3. Find and update Team Member in Firestore
      const teamMembersRef = db.collection('teamMembers');
      
      // Search by primary email
      let querySnapshot = await teamMembersRef
        .where('emailPrimary', '==', update.email)
        .get();
      
      // If not found, search by secondary email
      if (querySnapshot.empty) {
        querySnapshot = await teamMembersRef
          .where('emailSecondary', '==', update.email)
          .get();
      }

      if (!querySnapshot.empty) {
        // Update existing Team Member
        const docRef = querySnapshot.docs[0].ref;
        await docRef.update({
          role: update.role,
          firebaseUid: user.uid,
          updatedAt: new Date(),
        });
        console.log(`   ✓ Updated Team Member document: ${docRef.id}`);
      } else {
        // Create new Team Member document
        const nameParts = update.name.split(' ');
        const newDoc = await teamMembersRef.add({
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' '),
          emailPrimary: update.email,
          role: update.role,
          status: 'active',
          expertise: update.role === 'superadmin' ? 'Platform Administration' : 'Administration',
          firebaseUid: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`   ✓ Created Team Member document: ${newDoc.id}`);
      }

      console.log(`   ✅ Successfully updated ${update.name} to ${update.role}`);

    } catch (error) {
      console.error(`   ❌ Error processing ${update.email}:`, error);
    }
  }

  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║     ROLE UPDATE COMPLETE                  ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  console.log('📋 Summary:');
  console.log('   • brianstittsr@gmail.com → SuperAdmin');
  console.log('   • sblackman@itmcsolutions.com → Admin');
  console.log('\n📋 Role Permissions:');
  console.log('   SuperAdmin:');
  console.log('     - Full platform access');
  console.log('     - Can modify all users and settings');
  console.log('     - Can manage feature visibility');
  console.log('     - Can view as any role');
  console.log('   Admin:');
  console.log('     - Can view all data');
  console.log('     - Can create new users');
  console.log('     - Can edit newly created documents');
  console.log('     - CANNOT change settings');
  console.log('     - CANNOT delete users');
  console.log('     - CANNOT change user roles');
}

updateUserRoles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
