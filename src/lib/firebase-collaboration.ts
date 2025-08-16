import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  FieldValue
} from 'firebase/firestore';

// Team interface (for user-facing operations)
export interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

// Database Team interface (for Firestore operations)
interface DatabaseTeam {
  name: string;
  description: string;
  ownerId: string;
  members: TeamMember[];
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

// Team member interface
export interface TeamMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  displayName: string;
  email: string;
}

// Quiz sharing interface (for user-facing operations)
export interface QuizShare {
  id: string;
  quizId: string;
  sharedBy: string;
  sharedWith: string[];
  permissions: 'view' | 'edit' | 'admin';
  message?: string;
  createdAt: Date;
  expiresAt?: Date;
}

// Database Quiz Share interface (for Firestore operations)
interface DatabaseQuizShare {
  quizId: string;
  sharedBy: string;
  sharedWith: string[];
  permissions: 'view' | 'edit' | 'admin';
  message?: string;
  createdAt: FieldValue;
  expiresAt?: Date;
}

// Collaboration invitation interface (for user-facing operations)
export interface CollaborationInvite {
  id: string;
  type: 'team' | 'quiz';
  targetId: string; // teamId or quizId
  fromUserId: string;
  toUserId: string;
  role: 'admin' | 'member' | 'viewer';
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  expiresAt: Date;
}

// Database Collaboration Invite interface (for Firestore operations)
interface DatabaseCollaborationInvite {
  type: 'team' | 'quiz';
  targetId: string;
  fromUserId: string;
  toUserId: string;
  role: 'admin' | 'member' | 'viewer';
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: FieldValue;
  expiresAt: Date;
}

/**
 * Create a new team
 */
export async function createTeam(teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const teamDoc: DatabaseTeam = {
      name: teamData.name,
      description: teamData.description,
      ownerId: teamData.ownerId,
      members: teamData.members,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'teams'), teamDoc);
    console.log('✅ Team created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating team:', error);
    throw new Error('Failed to create team');
  }
}

/**
 * Get team by ID
 */
export async function getTeam(teamId: string): Promise<Team | null> {
  try {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    
    if (teamDoc.exists()) {
      const data = teamDoc.data();
      return {
        id: teamDoc.id,
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        members: data.members,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error getting team:', error);
    throw new Error('Failed to get team');
  }
}

/**
 * Get user's teams
 */
export async function getUserTeams(userId: string): Promise<Team[]> {
  try {
    const q = query(
      collection(db, 'teams'),
      where('members', 'array-contains', { userId }),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const teams: Team[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      teams.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        members: data.members,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });
    
    return teams;
  } catch (error) {
    console.error('❌ Error getting user teams:', error);
    throw new Error('Failed to get user teams');
  }
}

/**
 * Add member to team
 */
export async function addTeamMember(teamId: string, member: TeamMember): Promise<void> {
  try {
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      members: arrayUnion(member),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Team member added successfully');
  } catch (error) {
    console.error('❌ Error adding team member:', error);
    throw new Error('Failed to add team member');
  }
}

/**
 * Remove member from team
 */
export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
  try {
    const team = await getTeam(teamId);
    if (!team) throw new Error('Team not found');
    
    const updatedMembers = team.members.filter(member => member.userId !== userId);
    
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      members: updatedMembers,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Team member removed successfully');
  } catch (error) {
    console.error('❌ Error removing team member:', error);
    throw new Error('Failed to remove team member');
  }
}

/**
 * Share quiz with users
 */
export async function shareQuiz(shareData: Omit<QuizShare, 'id' | 'createdAt'>): Promise<string> {
  try {
    const shareDoc: DatabaseQuizShare = {
      quizId: shareData.quizId,
      sharedBy: shareData.sharedBy,
      sharedWith: shareData.sharedWith,
      permissions: shareData.permissions,
      message: shareData.message,
      createdAt: serverTimestamp(),
      expiresAt: shareData.expiresAt
    };

    const docRef = await addDoc(collection(db, 'quizShares'), shareDoc);
    console.log('✅ Quiz shared with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error sharing quiz:', error);
    throw new Error('Failed to share quiz');
  }
}

/**
 * Get shared quizzes for user
 */
export async function getSharedQuizzes(userId: string): Promise<QuizShare[]> {
  try {
    const q = query(
      collection(db, 'quizShares'),
      where('sharedWith', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const shares: QuizShare[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      shares.push({
        id: doc.id,
        quizId: data.quizId,
        sharedBy: data.sharedBy,
        sharedWith: data.sharedWith,
        permissions: data.permissions,
        message: data.message,
        createdAt: data.createdAt?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate()
      });
    });
    
    return shares;
  } catch (error) {
    console.error('❌ Error getting shared quizzes:', error);
    throw new Error('Failed to get shared quizzes');
  }
}

/**
 * Send collaboration invitation
 */
export async function sendInvitation(inviteData: Omit<CollaborationInvite, 'id' | 'createdAt' | 'expiresAt'>): Promise<string> {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
    
    const inviteDoc: DatabaseCollaborationInvite = {
      type: inviteData.type,
      targetId: inviteData.targetId,
      fromUserId: inviteData.fromUserId,
      toUserId: inviteData.toUserId,
      role: inviteData.role,
      message: inviteData.message,
      status: 'pending',
      createdAt: serverTimestamp(),
      expiresAt: expiresAt
    };

    const docRef = await addDoc(collection(db, 'collaborationInvites'), inviteDoc);
    console.log('✅ Invitation sent with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error sending invitation:', error);
    throw new Error('Failed to send invitation');
  }
}

/**
 * Get user's invitations
 */
export async function getUserInvitations(userId: string): Promise<CollaborationInvite[]> {
  try {
    const q = query(
      collection(db, 'collaborationInvites'),
      where('toUserId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const invitations: CollaborationInvite[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      invitations.push({
        id: doc.id,
        type: data.type,
        targetId: data.targetId,
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        role: data.role,
        message: data.message,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || new Date()
      });
    });
    
    return invitations;
  } catch (error) {
    console.error('❌ Error getting user invitations:', error);
    throw new Error('Failed to get user invitations');
  }
}

/**
 * Accept invitation
 */
export async function acceptInvitation(inviteId: string): Promise<void> {
  try {
    const inviteRef = doc(db, 'collaborationInvites', inviteId);
    await updateDoc(inviteRef, {
      status: 'accepted',
      updatedAt: serverTimestamp()
    });
    console.log('✅ Invitation accepted');
  } catch (error) {
    console.error('❌ Error accepting invitation:', error);
    throw new Error('Failed to accept invitation');
  }
}

/**
 * Decline invitation
 */
export async function declineInvitation(inviteId: string): Promise<void> {
  try {
    const inviteRef = doc(db, 'collaborationInvites', inviteId);
    await updateDoc(inviteRef, {
      status: 'declined',
      updatedAt: serverTimestamp()
    });
    console.log('✅ Invitation declined');
  } catch (error) {
    console.error('❌ Error declining invitation:', error);
    throw new Error('Failed to decline invitation');
  }
}

/**
 * Check if user has access to quiz
 */
export async function checkQuizAccess(quizId: string, userId: string): Promise<{
  hasAccess: boolean;
  permissions: 'owner' | 'edit' | 'view' | null;
}> {
  try {
    // Check if user is the owner
    const quiz = await getDoc(doc(db, 'quizzes', quizId));
    if (quiz.exists() && quiz.data().createdBy === userId) {
      return { hasAccess: true, permissions: 'owner' };
    }
    
    // Check if quiz is shared with user
    const q = query(
      collection(db, 'quizShares'),
      where('quizId', '==', quizId),
      where('sharedWith', 'array-contains', userId)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const share = querySnapshot.docs[0].data();
      return { hasAccess: true, permissions: share.permissions };
    }
    
    return { hasAccess: false, permissions: null };
  } catch (error) {
    console.error('❌ Error checking quiz access:', error);
    return { hasAccess: false, permissions: null };
  }
}
